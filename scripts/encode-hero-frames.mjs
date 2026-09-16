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
 * nearly every scroll tick, which is what made the scrub stutter.
 *
 * Usage:  node scripts/encode-hero-frames.mjs
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
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

/** Frame counts. Both are deliberately far below the 479 masters.
 *
 * The hero scrubs across a 360vh spacer, so on a ~844px-tall phone that is
 * ~3040px of scroll. At 479 frames that is one frame per 6.3px — a normal
 * flick (~2500px/s) would need ~400fps to show them all, and the display
 * does 60. The surplus frames are never painted; they only cost bandwidth
 * and decode. 120 frames puts mobile at ~25px/frame, which still changes
 * frames faster than the eye resolves stutter at any realistic scroll
 * speed. Desktop gets 240 for the wider viewport and longer scroll.
 *
 * Mobile's 528x487 is also a decoded-memory budget, not just a bandwidth
 * one: 120 frames x 528x487x4 bytes is ~123 MB of bitmap, which modern
 * phones hold without thrashing. Raising either number trades directly
 * against that. */
const VARIANTS = {
  desktop: {
    count: 240,
    width: MASTER.width,
    height: MASTER.height,
    crop: null,
    backdrop: false,
  },
  mobile: {
    count: 120,
    width: 528,
    height: Math.round((MOBILE_CROP.height * 528) / MOBILE_CROP.width),
    crop: MOBILE_CROP,
    backdrop: true,
  },
};

/** q90 rather than the usual q80-ish default: at 3x zoom q82 visibly
 * smooths away the film grain in the red field and softens the sweat-spray
 * highlights, and the grain is part of the look. The whole desktop set is
 * still ~6 MB against the masters' 226 MB, so the quality is free. */
const QUALITY = 90;
const CONCURRENCY = 8;

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

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

async function main() {
  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) throw new Error(`no PNGs found in ${SRC_DIR}`);
  console.log(`source: ${files.length} frames in ${SRC_DIR}`);

  for (const [name, cfg] of Object.entries(VARIANTS)) {
    const outDir = path.join(OUT_ROOT, name);
    await mkdir(outDir, { recursive: true });

    // Even resample across the whole master sequence, endpoints inclusive,
    // so the first and last output frames are the first and last masters
    // (the hero maps scroll progress 0 -> first and 1 -> last).
    const picks = Array.from({ length: cfg.count }, (_, j) =>
      files[Math.round((j * (files.length - 1)) / (cfg.count - 1))],
    );

    const backdrops = new Array(cfg.count);
    let bytes = 0;

    const encodeOne = async (j) => {
      const img = sharp(path.join(SRC_DIR, picks[j]));
      if (cfg.backdrop) backdrops[j] = await sampleBackdrop(img);
      let out = img.clone();
      if (cfg.crop) out = out.extract(cfg.crop);
      const buf = await out
        .resize(cfg.width, cfg.height, { fit: "fill" })
        .removeAlpha() // every master frame is fully opaque; drop the dead channel
        .webp({ quality: QUALITY, effort: 5 })
        .toBuffer();
      await writeFile(path.join(outDir, `${String(j).padStart(4, "0")}.webp`), buf);
      bytes += buf.length;
    };

    // Bounded concurrency: sharp is native and will happily saturate every
    // core, but an unbounded Promise.all over hundreds of 1280x720 decodes
    // spikes RSS hard enough to get the process killed.
    let next = 0;
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (next < cfg.count) await encodeOne(next++);
      }),
    );

    await writeFile(
      path.join(outDir, "manifest.json"),
      JSON.stringify(
        {
          count: cfg.count,
          width: cfg.width,
          height: cfg.height,
          // Fraction of the frame's height at which the athlete's feet meet
          // the floor. The mobile renderer anchors him to this rather than
          // centring the band, so he stands at a consistent height on screen
          // no matter how tall the viewport is.
          groundY: 0.955,
          ...(cfg.backdrop ? { backdrops } : {}),
        },
        null,
        cfg.backdrop ? 0 : 2,
      ) + "\n",
    );

    const mb = (bytes / 1024 / 1024).toFixed(1);
    const kb = (bytes / cfg.count / 1024).toFixed(0);
    const px = ((cfg.width * cfg.height * 4 * cfg.count) / 1024 / 1024).toFixed(0);
    console.log(
      `${name}: ${cfg.count} frames @ ${cfg.width}x${cfg.height}, ` +
        `${mb} MB total, ${kb} KB avg, ~${px} MB decoded -> ${outDir}`,
    );
  }
}

await main();
