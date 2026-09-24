/**
 * Checks the invariants the hero's two timelines have to hold, and prints
 * them so the pacing can be read without opening the page.
 *
 * Neither timeline is written down anywhere as numbers. Both are laid out at
 * runtime in equipment-hero-section.tsx from the chapter anchors in the
 * manifests — buildTimeline against the scrollbar for desktop,
 * buildLoopWindows against the video's clock for mobile — so that
 * re-encoding the footage re-times the hero instead of silently desyncing
 * it. The cost of that is that a bad manifest or a bad constant produces a
 * broken hero with nothing obviously wrong in the source, which is what
 * this catches:
 *
 *   desktop — the athlete's playback rate is constant across every travel
 *     stretch (the reason the travel budget is shared out by frame count
 *     rather than per chapter); the holds are ordered and don't overlap;
 *     the opening hold doesn't spend scroll on a frozen screen; the last
 *     hold hands over to the blackout with no dead scroll.
 *
 *   mobile — the cycle is LOOP_PASSES_PER_CYCLE video passes, so the windows tile it
 *     with no gap and every beat gets a full pass to be read. The pose each
 *     beat names comes round inside its own pass, which is the weaker
 *     guarantee that replaced frame-locked cueing when the clip was sped up
 *     (five beats do not fit into eight seconds — see LOOP_RATE).
 *
 * This reimplements both layouts rather than importing them (the component
 * is TSX and full of React). That is deliberate — it is a second opinion,
 * not a mirror — but it does mean the constants are read from the
 * component, not copied here, the same way verify-hero-diagonal.mjs does.
 *
 * Usage:  node scripts/verify-hero-timeline.mjs   (npm run hero:timeline)
 */
import { readFile } from "node:fs/promises";

const COMPONENT = "components/ui/equipment-hero-section.tsx";
const STYLESHEET = "components/ui/equipment-hero-section.css";
const VIDEO = "public/videos/hero-loop.mp4";

/** How far the frames-per-scroll rate may vary between travel stretches.
 * Above this and his apparent playback speed visibly lurches when a beat
 * ends, which is the exact defect the proportional budget exists to fix. */
const MAX_RATE_SPREAD = 0.02;
/** The shortest a beat may be on screen. Below about this the copy is gone
 * before it has been read, which is the failure the holds and the loop
 * windows both exist to prevent. */
const MIN_BEAT_SECONDS = 2.2;
/** And the longest, on mobile: a beat that outstays a pass and a half of
 * the footage stops reading as a caption on the loop and starts reading as
 * a page that has stopped updating. */
const MAX_BEAT_PASSES = 1.5;
/** Scroll spent at the top of the hero with the frame held and the h1
 * pinned — the user drags and nothing moves. */
const MAX_FROZEN_VH = 25;

function constant(src, name) {
  const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*([0-9.]+)\\s*;`));
  if (!m) throw new Error(`could not find ${name} in ${COMPONENT}`);
  return Number(m[1]);
}

const src = await readFile(COMPONENT, "utf8");
const DWELL = constant(src, "DWELL");
const OUTRO = constant(src, "OUTRO");
const INTRO_DWELL = constant(src, "INTRO_DWELL");
const LOOP_RATE = constant(src, "LOOP_RATE");
const LOOP_FADE = constant(src, "LOOP_FADE");
const LOOP_PASSES_PER_CYCLE = constant(src, "LOOP_PASSES_PER_CYCLE");
const dwellFor = (i) => (i === 0 ? INTRO_DWELL : DWELL);

const css = await readFile(STYLESHEET, "utf8");
const spacerMatch = css.match(/\.hero-scroll-spacer\s*\{[^}]*height:\s*([0-9.]+)vh/);
if (!spacerMatch) throw new Error(`could not find .hero-scroll-spacer height in ${STYLESHEET}`);
// .hero-content is fixed, so the spacer is the container's whole height, and
// progress runs from its top hitting the top of the screen to its bottom
// hitting the bottom — a scrollable range of one viewport less.
const RANGE_VH = Number(spacerMatch[1]) - 100;

/** The clip's real duration, read from its own mvhd box rather than assumed,
 * so swapping the video for a longer or shorter one shows up here as
 * re-timed beats instead of as a surprise on a phone. */
async function clipSeconds(file) {
  const b = await readFile(file);
  const findIn = (start, end) => {
    let p = start;
    while (p + 8 <= end) {
      let size = b.readUInt32BE(p);
      const type = b.toString("latin1", p + 4, p + 8);
      let hdr = 8;
      if (size === 1) {
        size = Number(b.readBigUInt64BE(p + 8));
        hdr = 16;
      }
      if (size === 0) size = end - p;
      if (size < hdr) return null;
      if (type === "mvhd") {
        const s = p + hdr;
        return b[s] === 1
          ? Number(b.readBigUInt64BE(s + 24)) / b.readUInt32BE(s + 20)
          : b.readUInt32BE(s + 16) / b.readUInt32BE(s + 12);
      }
      if (type === "moov") {
        const found = findIn(p + hdr, p + size);
        if (found) return found;
      }
      p += size;
    }
    return null;
  };
  const d = findIn(0, b.length);
  if (!d) throw new Error(`could not read a duration from ${file}`);
  return d;
}

const problems = [];
const check = (ok, message) => {
  if (!ok) problems.push(message);
};

// ---------------------------------------------------------------------------
// Desktop: the scroll timeline
// ---------------------------------------------------------------------------

function buildTimeline(chapters) {
  const gaps = chapters.slice(1).map((c, i) => Math.max(1, c.frame - chapters[i].frame));
  const totalGap = gaps.reduce((a, b) => a + b, 0);
  const totalDwell = chapters.reduce((sum, _, i) => sum + dwellFor(i), 0);
  const travelBudget = Math.max(0, 1 - OUTRO - totalDwell);

  const segments = [];
  let t = 0;
  chapters.forEach((c, i) => {
    segments.push({ key: c.key, frame: c.frame, holdStart: t, holdEnd: t + dwellFor(i) });
    t += dwellFor(i);
    if (i < gaps.length) t += (travelBudget * gaps[i]) / totalGap;
  });
  return segments;
}

const desktop = JSON.parse(await readFile("public/hero/desktop/manifest.json", "utf8"));
const segments = buildTimeline(desktop.chapters);

console.log(
  `desktop — scroll-scrubbed: dwell ${DWELL} per beat (${INTRO_DWELL} intro), ` +
    `outro ${OUTRO}, range ${RANGE_VH}vh, ${desktop.count} frames\n`,
);
console.log("  chapter    frame    hold (progress)        hold    travel out     rate");

const rates = [];
segments.forEach((s, i) => {
  const next = segments[i + 1];
  const travel = next ? next.holdStart - s.holdEnd : 0;
  const frames = next ? next.frame - s.frame : 0;
  const rate = travel > 0 ? frames / travel : 0;
  if (next) rates.push(rate);
  console.log(
    `  ${s.key.padEnd(9)} ${String(s.frame).padStart(6)}   ` +
      `${s.holdStart.toFixed(3)} - ${s.holdEnd.toFixed(3)}   ` +
      `${((s.holdEnd - s.holdStart) * RANGE_VH).toFixed(0).padStart(4)}vh   ` +
      `${(travel * RANGE_VH).toFixed(0).padStart(5)}vh ${String(frames).padStart(4)}f   ` +
      (rate ? `${(RANGE_VH / rate).toFixed(2)} vh/frame` : ""),
  );

  check(
    s.holdEnd <= (next ? next.holdStart : 1) + 1e-9,
    `desktop: ${s.key}'s hold overruns ${next ? next.key : "the end of the hero"}`,
  );
  check(
    !next || next.frame > s.frame,
    `desktop: chapter frames are not ascending (${s.key} -> ${next?.key})`,
  );
});

const spread = (Math.max(...rates) - Math.min(...rates)) / Math.min(...rates);
console.log(`  playback rate spread across travel stretches: ${(spread * 100).toFixed(2)}%`);
check(
  spread <= MAX_RATE_SPREAD,
  `desktop: playback rate varies ${(spread * 100).toFixed(1)}% between travel stretches ` +
    `(max ${MAX_RATE_SPREAD * 100}%) — he will visibly speed up or slow down at a beat boundary`,
);
check(
  segments[0].holdEnd * RANGE_VH <= MAX_FROZEN_VH,
  `desktop: the opening chapter holds for ${(segments[0].holdEnd * RANGE_VH).toFixed(0)}vh ` +
    `before anything moves — that is scroll the user spends dragging at a frozen screen`,
);
const last = segments[segments.length - 1];
check(
  Math.abs(last.holdEnd - (1 - OUTRO)) < 1e-9,
  `desktop: the last hold ends at ${last.holdEnd.toFixed(3)} but the blackout starts at ` +
    `${(1 - OUTRO).toFixed(3)} — that gap is dead scroll with nothing happening in it`,
);
check(
  last.frame === desktop.count - 1,
  `desktop: the last chapter holds on frame ${last.frame} of ${desktop.count}, so the ` +
    `sequence never reaches its final frame`,
);

// ---------------------------------------------------------------------------
// Mobile: the video loop
// ---------------------------------------------------------------------------

/** One window per chapter, each an equal share of the cycle — which is one
 * pass of the video, since the cycle is exactly as many passes as there are
 * chapters. */
function buildLoopWindows(chapters) {
  return chapters.map((c, i) => ({
    key: c.key,
    at: c.at,
    from: i / chapters.length,
    to: (i + 1) / chapters.length,
  }));
}

const mobile = JSON.parse(await readFile("public/hero/mobile/manifest.json", "utf8"));
const windows = buildLoopWindows(mobile.chapters);
const clip = await clipSeconds(VIDEO);
const pass = clip / LOOP_RATE;
const cycle = pass * LOOP_PASSES_PER_CYCLE;

console.log(
  `\nmobile — video loop: ${clip.toFixed(2)}s clip at ${LOOP_RATE}x = ${pass.toFixed(1)}s per pass, ` +
    `${LOOP_PASSES_PER_CYCLE} passes per cycle = ${cycle.toFixed(1)}s for all ` +
    `${mobile.chapters.length} beats\n`,
);
console.log("  chapter    window (cycle)       on screen   its pose lands");

windows.forEach((w, i) => {
  const seconds = (w.to - w.from) * cycle;
  console.log(
    `  ${w.key.padEnd(9)} ${w.from.toFixed(3)} - ${w.to.toFixed(3)}   ` +
      `${seconds.toFixed(1).padStart(5)}s     ` +
      `${(w.at * pass).toFixed(1)}s into the pass it opens on`,
  );

  const next = windows[i + 1];
  check(
    !next || Math.abs(w.to - next.from) < 1e-9,
    `mobile: ${w.key} ends at ${w.to.toFixed(3)} but ${next?.key} starts at ` +
      `${next?.from.toFixed(3)} — the cycle has a stretch with no copy on it`,
  );
  check(
    seconds >= MIN_BEAT_SECONDS,
    `mobile: ${w.key} is on screen for ${seconds.toFixed(1)}s (min ${MIN_BEAT_SECONDS}s) — ` +
      `raise LOOP_PASSES_PER_CYCLE, or lower LOOP_RATE to stretch each pass`,
  );
  check(
    seconds <= pass * MAX_BEAT_PASSES,
    `mobile: ${w.key} is on screen for ${seconds.toFixed(1)}s, over ${MAX_BEAT_PASSES} passes of ` +
      `a ${pass.toFixed(1)}s loop — the copy is outstaying the footage it sits on`,
  );
});

check(
  Math.abs(windows[0].from) < 1e-9 && Math.abs(windows[windows.length - 1].to - 1) < 1e-9,
  "mobile: the windows do not cover the whole cycle",
);
// Fades are sequenced, not crossfaded: a beat spends LOOP_FADE * 2 fading
// in and the same again fading out, all of it inside its own window, so
// four fade-widths of every window are less than fully legible.
check(
  LOOP_FADE * 4 * cycle < MIN_BEAT_SECONDS / 2,
  `mobile: fading in and out costs ${(LOOP_FADE * 4 * cycle).toFixed(2)}s of every beat's ` +
    `window, long enough to eat into the time each one is legible for`,
);
check(
  desktop.chapters.map((c) => c.key).join() === mobile.chapters.map((c) => c.key).join(),
  "desktop and mobile manifests list different chapters, so the two renderings would " +
    "show different copy over the same footage",
);

console.log();
if (problems.length) {
  for (const p of problems) console.error(`FAIL: ${p}`);
  process.exitCode = 1;
} else {
  console.log("OK: both timelines hold — the scrub rests on its poses, the loop tiles cleanly.");
}
