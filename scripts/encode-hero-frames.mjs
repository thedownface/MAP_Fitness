/**
 * Re-encodes the raw hero frame sequence in public/athlete/ into the two
 * web-ready sets the hero actually loads:
 *
 *   public/hero/desktop/  1280x720 WebP, full frame
 *   public/hero/mobile/    528x487 WebP, cropped to MOBILE_CROP
 *   public/hero/<set>/manifest.json
 *
 * The raw PNGs are read-only inputs and are never modified — they stay on
 * disk as the master set so this can be re-run with different settings.
 *
 * Why the masters can't be served directly: the 479 PNGs are 226 MB on the
 * wire and ~1.76 GB decoded, they carry a fully-opaque alpha channel
 * (verified: every master frame's alpha is 255 everywhere), and PNG is the
 * slowest format to decode for grainy photographic content. Mobile Safari
 * evicts them from its image cache almost immediately and re-decodes on
 * nearly every scroll tick.
 *
 * THE IMPORTANT PART — why this script has an analysis pass at all:
 *
 * 294 of the 479 masters (61%) are byte-for-byte repeats of the frame
 * before them. They arrive in runs of 2 and 3, in an alternating pattern —
 * the signature of ~24fps of generated motion exported at 60fps. Only 185
 * of the masters are distinct poses.
 *
 * Resampling that sequence evenly by *position*, which this script used to
 * do, carries the pattern straight through: the old 240-frame desktop set
 * had 56 frames identical to their predecessor. Scrubbing it moved the
 * athlete on a jump / hold / jump / hold-hold cadence, and that irregular
 * stutter is indistinguishable from dropped frames — it reads as scroll
 * lag even on a machine with cycles to spare, because on those ticks there
 * is genuinely nothing new to paint.
 *
 * So the sampling below runs over *distinct* frames, not over positions.
 * Every output frame differs from its neighbours, which makes the cadence
 * uniform and, as a bonus, cuts the payload: the surplus frames were pure
 * bandwidth and decode cost for zero motion.
 *
 * Usage:  node scripts/encode-hero-frames.mjs
 */
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const sharp = (await import("sharp")).default;

const SRC_DIR = "public/athlete";
const OUT_ROOT = "public/hero";
const MASTER = { width: 1280, height: 720 };

/** Horizontal window containing the athlete in every pose, centred on where
 * he actually stands. Measured, not guessed:
 *
 *   - his silhouette across the whole sequence spans x∈[328,1024] (widest
 *     single pose is the dive at frame 386, 628px across)
 *   - but his centre is not the centre of that span: it sits at x≈635 for
 *     the standing and fighting poses that make up most of the sequence,
 *     and only travels right to x≈818 during the run and dive
 *
 * An earlier crop centred on the *span* (x=676) therefore put him visibly
 * left of centre for most of the hero — the median pose landed at 0.44 of
 * the frame width. Centring on x=636 instead costs width, because the crop
 * must still reach x=1024 for the dive: half-width has to be ≥390, so this
 * is 780 wide rather than 700. He renders about 10% smaller as a result,
 * which is the price of him being centred.
 *
 * Full height is kept — he stands on a ground line near y=690 in every
 * frame. Cropping at all is the whole point on mobile: the phone viewport
 * is portrait, so cover-fitting the full 16:9 master showed only its centre
 * ~26% of width and sliced the legs off the run and dive frames. */
const MOBILE_CROP = { left: 246, top: 0, width: 780, height: 720 };

/** Region guaranteed to be pure backdrop in every frame — it ends 8px
 * before the silhouette union above ever begins. Used only as a fallback
 * when an edge strip of the crop is almost entirely silhouette. (It
 * overlaps the left of MOBILE_CROP now that the crop reaches x=246; that is
 * fine, it is sampled from the master, not from the crop.) */
const BACKDROP_FALLBACK = { left: 0, top: 0, width: 320, height: 720 };

/** How many rows at the very top and very bottom of the crop to average for
 * the fill colours, and the red-channel floor that separates backdrop from
 * silhouette (backdrop red sits at ~190-205, the silhouette far below it). */
const EDGE_ROWS = 16;
const BACKDROP_MIN_RED = 150;

/** Resolution of the analysis pass. Everything below — duplicate detection,
 * the dissolve filter, the stillness and sharpness scores — is measured on
 * a downscaled greyscale copy. The features being measured (a whole body
 * moving, a whole body ghosted, the edge of a silhouette) are far larger
 * than the detail this throws away, and 479 full-size decodes would take
 * minutes instead of seconds. */
const ANALYSIS = { width: 320, height: 180 };

/** Masters where the generated footage cross-dissolves between two takes:
 * a translucent standing figure fades through a crawling one, so for ~15
 * frames the hero paints a double exposure. Held still it looks like a
 * deliberate effect; scrubbed, it looks like the page is rendering two
 * frames at once, which is the worst possible thing to show a user who is
 * already suspicious that it is lagging.
 *
 * Detected rather than hardcoded so a re-render of the source doesn't
 * silently reintroduce it at different indices. The measure is the share of
 * pixels whose red channel sits *between* the backdrop (~190-205) and the
 * silhouette (~30) — that band is only anti-aliased silhouette edge in a
 * clean frame, and a whole second body during a dissolve. Measured on the
 * current masters: 1.0-2.3% everywhere clean, 6.8-16.6% across the
 * dissolve. 4% splits that with room on both sides. */
const GHOST_RED = { min: 70, max: 165 };
const GHOST_MAX_SHARE = 0.04;

/** Where the athlete settles into a pose worth stopping on, as ranges of
 * master *file number* (the PNGs are named 002.png … 480.png, so these are
 * filenames, not array indices — they stay meaningful if the set is ever
 * re-exported with a different resample).
 *
 * The hero holds the frame-scrub still at one frame inside each of these
 * windows while that chapter's copy is on screen, so the athlete is
 * visibly posed rather than smeared mid-movement. Which frame exactly is
 * measured, not picked: see pickAnchor below.
 *
 * `key` is the join to the copy in equipment-hero-section.tsx. The
 * choreography lives here, next to the pipeline that reads the footage;
 * the words live there, next to the type that renders them. */
const CHAPTERS = [
  { key: "stance", from: 2, to: 60 },    // standing, arms down — the opening
  { key: "guard", from: 180, to: 250 },  // wide stance, fists up
  { key: "drive", from: 270, to: 320 },  // sprint drive, sweat spray
  { key: "floor", from: 360, to: 400 },  // down on the floor, bear crawl
  { key: "recover", from: 450, to: 478 },// hands on knees, breathing
];

/** What each variant publishes.
 *
 * Desktop gets every distinct frame — stride 1. There are ~175 of them
 * after the duplicates and the dissolve come out, which is fewer than the
 * 240 the old even-by-position resample produced, and every one of them
 * moves. No resampling step means no chance of the stride beating against
 * the source's own cadence and reintroducing a judder of its own.
 *
 * Mobile gets one frame. It used to get a sequence of its own, but a phone
 * now plays public/videos/hero-loop.mp4 rather than scrubbing frames (see
 * the header of equipment-hero-section.tsx), so the only image it still
 * needs is a poster to hold under the video until it starts — and on iOS
 * Low Power Mode, which refuses inline autoplay outright, instead of it.
 * The rest of its old manifest is what survives and matters: the crop, the
 * ground line and the plate colours, which is the geometry the stylesheet
 * reproduces around the video.
 *
 * Its `crop` is still what sizes the poster, and still what the diagonal is
 * verified against (`npm run hero:diagonal`, which applies it to the
 * desktop frames in software now that there is no mobile sequence to
 * measure). */
const VARIANTS = {
  desktop: {
    stride: 1,
    width: MASTER.width,
    height: MASTER.height,
    crop: null,
    backdrop: false,
  },
  mobile: {
    poster: true,
    width: 528,
    height: Math.round((MOBILE_CROP.height * 528) / MOBILE_CROP.width),
    crop: MOBILE_CROP,
    backdrop: true,
  },
};

/** q90 rather than the usual q80-ish default: at 3x zoom q82 visibly
 * smooths away the film grain in the red field and softens the sweat-spray
 * highlights, and the grain is part of the look. The whole desktop set is
 * still a few MB against the masters' 226 MB, so the quality is free. */
const QUALITY = 90;
const CONCURRENCY = 8;

/** Output filename for a variant's frame j. */
const frameName = (cfg, j) =>
  cfg.poster ? "poster.webp" : `${String(j).padStart(4, "0")}.webp`;

/** map with bounded concurrency, results in input order. */
async function mapConcurrent(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const unhex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** [mean top colour, mean bottom colour] over every frame's sampled pair. */
const meanColour = (pairs) =>
  [0, 1].map((edge) =>
    hex(
      pairs
        .map((p) => unhex(p[edge]))
        .reduce(
          (sum, c) => sum.map((v, i) => v + c[i] / pairs.length),
          [0, 0, 0],
        ),
    ),
  );

// ---------------------------------------------------------------------------
// Analysis pass
// ---------------------------------------------------------------------------

const { width: AW, height: AH } = ANALYSIS;

/** Greyscale for motion/sharpness, plus the raw red channel for the ghost
 * test — both off one decode, since decoding is the expensive part. */
async function analyse(file) {
  const img = sharp(path.join(SRC_DIR, file)).resize(AW, AH, { fit: "fill" });
  const [grey, { data: rgb }] = await Promise.all([
    img.clone().greyscale().raw().toBuffer(),
    img.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  let ghost = 0;
  for (let p = 0; p < AW * AH; p++) {
    const r = rgb[p * 3];
    if (r > GHOST_RED.min && r < GHOST_RED.max) ghost++;
  }

  return { grey, ghost: ghost / (AW * AH) };
}

/** Mean absolute difference between two greyscale frames. Zero means the
 * masters are identical, which is how the duplicate runs are found. */
function meanDiff(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

/** Mean gradient magnitude — high on a crisply-edged silhouette, low on one
 * smeared by motion blur. Used only to compare frames of the same subject
 * against each other, never as an absolute quality measure. */
function edgeEnergy(g) {
  let sum = 0;
  let n = 0;
  for (let y = 1; y < AH - 1; y++) {
    for (let x = 1; x < AW - 1; x++) {
      const i = y * AW + x;
      const gx = g[i + 1] - g[i - 1];
      const gy = g[i + AW] - g[i - AW];
      sum += Math.sqrt(gx * gx + gy * gy);
      n++;
    }
  }
  return sum / n;
}

/** The frame to hold on inside one chapter window: sharp, and as close to
 * rest as that stretch of the performance gets.
 *
 * Both halves are needed. Sharpness alone picks whichever frame happens to
 * have the most contrast, which during the sprint is a fully extended,
 * hard-blurred stride. Stillness alone picks the slowest frame, which can
 * be slow precisely because he is at the top of an arc with his limbs
 * smeared. Dividing by the local motion biases toward the moment the pose
 * arrives and settles, which is the moment that reads as a photograph.
 *
 * `motion` is the mean of the gap to the previous and next *kept* frames,
 * so it measures real movement rather than the source's duplicate runs. */
function pickAnchor(kept, from, to) {
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < kept.length; i++) {
    const n = kept[i].number;
    if (n < from || n > to) continue;
    const prev = kept[i - 1] ?? kept[i];
    const next = kept[i + 1] ?? kept[i];
    const motion =
      (meanDiff(prev.grey, kept[i].grey) + meanDiff(kept[i].grey, next.grey)) / 2;
    const score = kept[i].edge / (1 + motion);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best < 0) throw new Error(`no frame survived in chapter window ${from}-${to}`);
  return best;
}

/** The distinct, usable frames: duplicates collapsed to their first
 * occurrence, dissolve frames dropped. Returned in source order with the
 * per-frame measurements the anchor picker needs. */
async function buildKeptFrames(files) {
  const measured = new Array(files.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < files.length) {
        const i = next++;
        measured[i] = await analyse(files[i]);
      }
    }),
  );

  const kept = [];
  let dupes = 0;
  let ghosts = 0;
  let prevGrey = null;
  for (let i = 0; i < files.length; i++) {
    const m = measured[i];
    if (m.ghost > GHOST_MAX_SHARE) {
      ghosts++;
      continue;
    }
    // Compared against the last frame *kept*, not the last frame seen, so a
    // run of three identical masters collapses to one rather than to two.
    if (prevGrey && meanDiff(prevGrey, m.grey) === 0) {
      dupes++;
      continue;
    }
    prevGrey = m.grey;
    kept.push({
      file: files[i],
      number: parseInt(files[i], 10),
      // Where this frame sits in the source clip, 0..1. The mobile hero
      // plays public/videos/hero-loop.mp4 — the same footage as a video —
      // and times its copy off this, so both renderings show the same words
      // over the same pose. A fraction rather than a timestamp because
      // nothing in this pipeline knows the clip's duration; the player does,
      // and multiplies.
      at: i / (files.length - 1),
      grey: m.grey,
      edge: edgeEnergy(m.grey),
    });
  }

  console.log(
    `analysis: ${files.length} masters -> ${kept.length} distinct ` +
      `(${dupes} duplicate frames dropped, ${ghosts} cross-dissolve frames dropped)`,
  );
  if (dupes / files.length > 0.5) {
    console.log(
      "  note: the source is majority duplicate frames — it was exported at a " +
        "higher frame rate than it was generated at. That is expected, and is " +
        "what this pass exists to undo.",
    );
  }
  return kept;
}

// ---------------------------------------------------------------------------
// Mobile backdrop sampling
// ---------------------------------------------------------------------------

/** The two colours the mobile renderer fills the screen with, above and
 * below the athlete band: the mean backdrop colour of the crop's own top
 * and bottom edge rows.
 *
 * Sampled from the crop's edges, not from a clean strip elsewhere in the
 * plate, because the fill has to continue those exact rows — anything else
 * leaves a step at the seam, and a straight horizontal step reads as a
 * visible band edge even at a couple of levels. The bottom is the offender
 * in this footage: the floor plane sits at red ~190 while the backdrop
 * beside it is ~201, so sampling away from the crop left an 11-level jump.
 *
 * Silhouette pixels are excluded by red threshold rather than by averaging
 * everything, since he reaches both edges in some poses and the ground
 * shadow darkens the bottom rows in most of them. If a strip somehow has
 * almost no backdrop left, fall back to the always-clean side region. */
async function sampleEdge(img, top) {
  const region = { left: MOBILE_CROP.left, width: MOBILE_CROP.width, top, height: EDGE_ROWS };
  const { data, info } = await img
    .clone()
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let n = 0;
  const sum = [0, 0, 0];
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 3;
    if (data[o] < BACKDROP_MIN_RED) continue;
    sum[0] += data[o];
    sum[1] += data[o + 1];
    sum[2] += data[o + 2];
    n++;
  }
  if (n / (info.width * info.height) < 0.02) {
    const px = await img
      .clone()
      .extract(BACKDROP_FALLBACK)
      .removeAlpha()
      .resize(1, 1, { fit: "fill" })
      .raw()
      .toBuffer();
    return hex([px[0], px[1], px[2]]);
  }
  return hex(sum.map((v) => v / n));
}

const sampleBackdrop = async (img) => [
  await sampleEdge(img, 0),
  await sampleEdge(img, MOBILE_CROP.height - EDGE_ROWS),
];

// ---------------------------------------------------------------------------

async function main() {
  const files = (await readdir(SRC_DIR))
    .filter((f) => f.endsWith(".png"))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  if (files.length === 0) throw new Error(`no PNGs found in ${SRC_DIR}`);
  console.log(`source: ${files.length} frames in ${SRC_DIR}`);

  const kept = await buildKeptFrames(files);

  // Anchors are resolved against the distinct list once, then mapped into
  // each variant's own numbering below — so both variants stop on the same
  // photograph even though they sample it at different strides.
  const anchors = CHAPTERS.map((c) => ({ key: c.key, kept: pickAnchor(kept, c.from, c.to) }));
  console.log(
    "anchors: " +
      anchors
        .map((a) => `${a.key}=${kept[a.kept].file}@${(kept[a.kept].at * 100).toFixed(1)}%`)
        .join("  "),
  );

  for (const [name, cfg] of Object.entries(VARIANTS)) {
    const outDir = path.join(OUT_ROOT, name);
    await mkdir(outDir, { recursive: true });

    // Which distinct frames this variant publishes. The poster variant
    // publishes exactly one — the opening stance anchor, the frame the
    // video's own first frame is.
    const indices = cfg.poster
      ? [anchors[0].kept]
      : (() => {
          // Anchors are forced into the selection rather than left to
          // chance: the whole point of an anchor is that the scrub stops on
          // that exact photograph, and any stride above 1 has a good chance
          // of skipping one.
          const picked = new Set();
          for (let i = 0; i < kept.length; i += cfg.stride) picked.add(i);
          for (const a of anchors) picked.add(a.kept);
          return [...picked].sort((x, y) => x - y);
        })();
    const count = indices.length;

    // kept-index -> this variant's output index. The poster variant has no
    // sequence to index into, so its chapters carry only the clip position
    // the video is cued from.
    const outIndex = new Map(indices.map((k, j) => [k, j]));
    const chapters = anchors.map((a) => ({
      key: a.key,
      ...(cfg.poster ? {} : { frame: outIndex.get(a.kept) }),
      at: Number(kept[a.kept].at.toFixed(5)),
    }));

    // Sampled across every distinct frame, not just the published ones:
    // `plate` is a mean over the whole clip, and the poster variant only
    // publishes one image to take it from.
    const backdrops = cfg.backdrop
      ? await mapConcurrent(kept, (k) => sampleBackdrop(sharp(path.join(SRC_DIR, k.file))))
      : [];

    let bytes = 0;
    const encodeOne = async (j) => {
      let out = sharp(path.join(SRC_DIR, kept[indices[j]].file));
      if (cfg.crop) out = out.extract(cfg.crop);
      const buf = await out
        .resize(cfg.width, cfg.height, { fit: "fill" })
        .removeAlpha() // every master frame is fully opaque; drop the dead channel
        .webp({ quality: QUALITY, effort: 5 })
        .toBuffer();
      await writeFile(path.join(outDir, frameName(cfg, j)), buf);
      bytes += buf.length;
    };

    // Bounded concurrency: sharp is native and will happily saturate every
    // core, but an unbounded Promise.all over hundreds of 1280x720 decodes
    // spikes RSS hard enough to get the process killed.
    let next = 0;
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (next < count) await encodeOne(next++);
      }),
    );

    // Anything a previous run published that this one did not would still
    // be on disk and still be served — dead weight in the deploy, and for
    // mobile that is now an entire 89-frame sequence nothing reads.
    const wanted = new Set(Array.from({ length: count }, (_, j) => frameName(cfg, j)));
    const stale = (await readdir(outDir)).filter(
      (f) => f.endsWith(".webp") && !wanted.has(f),
    );
    await Promise.all(stale.map((f) => unlink(path.join(outDir, f))));

    await writeFile(
      path.join(outDir, "manifest.json"),
      JSON.stringify(
        {
          ...(cfg.poster ? { poster: frameName(cfg, 0) } : { count }),
          width: cfg.width,
          height: cfg.height,
          // Fraction of the frame's height at which the athlete's feet meet
          // the floor. The mobile renderer anchors him to this rather than
          // centring the band, so he stands at a consistent height on screen
          // no matter how tall the viewport is.
          groundY: 0.955,
          // The poses the hero stops on, one per chapter. `at` is the
          // moment as a fraction of the source clip — what the mobile video
          // loop cues its copy off — and `frame`, where there is a sequence,
          // is the index the desktop scrub holds on. See CHAPTERS above and
          // the copy in equipment-hero-section.tsx.
          chapters,
          // The window of the master frame this variant was cropped to, and
          // the master's own size. Published because the mobile hero plays
          // the *uncropped* clip as a video and has to reproduce this crop
          // in CSS — reading it from here keeps one definition of where the
          // athlete is in frame instead of two that drift.
          ...(cfg.crop
            ? { crop: { ...cfg.crop, source: { width: MASTER.width, height: MASTER.height } } }
            : {}),
          // The mean backdrop colour of the clip's top and bottom edges,
          // over every distinct frame. The mobile hero plays a video rather
          // than drawing frames, so it cannot fill from the frame currently
          // on screen — it paints one gradient behind the whole loop
          // instead, and this is the closest single pair to every frame in
          // it. (The per-frame spread is about 5 levels; the film grain
          // itself varies by ~6.)
          ...(cfg.backdrop ? { plate: meanColour(backdrops) } : {}),
        },
        null,
        2,
      ) + "\n",
    );

    const kb = (bytes / 1024).toFixed(0);
    const removed = stale.length ? ` (${stale.length} stale frames removed)` : "";
    if (cfg.poster) {
      console.log(`${name}: poster @ ${cfg.width}x${cfg.height}, ${kb} KB -> ${outDir}${removed}`);
    } else {
      const px = ((cfg.width * cfg.height * 4 * count) / 1024 / 1024).toFixed(0);
      console.log(
        `${name}: ${count} frames @ ${cfg.width}x${cfg.height}, ` +
          `${(bytes / 1024 / 1024).toFixed(1)} MB total, ${(bytes / count / 1024).toFixed(0)} KB avg, ` +
          `~${px} MB decoded -> ${outDir}${removed}`,
      );
    }
  }
}

await main();
