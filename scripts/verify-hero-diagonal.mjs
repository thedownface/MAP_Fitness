/**
 * Checks the one invariant holding the mobile hero together: on every
 * published mobile frame, at every viewport, the athlete's silhouette stays
 * below the diagonal that clips the canvas.
 *
 * If it does not, the clip slices a hard line across his body — and because
 * the region above the split is the same near-black as the silhouette, the
 * only part you actually see go missing is the rim light on his shoulders
 * and arms, which is easy to miss in a single screenshot and obvious once
 * the page is scrolling.
 *
 * Four separate numbers decide this — the crop in encode-hero-frames.mjs,
 * and MOBILE_DIAGONAL_LEFT/RIGHT, MOBILE_FEET_Y and MOBILE_MAX_HEIGHT in
 * equipment-hero-section.tsx — so run this after touching any of them.
 * Constants are read from the component rather than duplicated here.
 *
 * Usage:  node scripts/verify-hero-diagonal.mjs
 */
import { readFile } from "node:fs/promises";

const sharp = (await import("sharp")).default;

const COMPONENT = "components/ui/equipment-hero-section.tsx";
const MANIFEST = "public/hero/mobile/manifest.json";
const FRAME_DIR = "public/hero/mobile";

/** Columns sampled per frame. The silhouette edge is smooth at this scale,
 * so more columns find the same worst case a lot more slowly. */
const COLUMNS = 132;
/** Backdrop red sits at ~190-205; the silhouette is far below it. */
const MAX_RED = 110;
const MAX_GREEN = 70;
/** Clearance below this is treated as too close to trust, even though it
 * technically passes — these are measurements of lossy WebP, and the frames
 * get re-encoded. */
const MIN_CLEARANCE_PX = 3;

const VIEWPORTS = [
  [320, 568, "iPhone SE (1st gen)"],
  [360, 640, "Android 16:9"],
  [375, 667, "iPhone SE / 8"],
  [360, 800, "Android 20:9"],
  [390, 844, "iPhone 14 / 15"],
  [393, 852, "iPhone 15 Pro"],
  [412, 915, "Pixel 7"],
  [430, 932, "iPhone 15 Pro Max"],
  [768, 900, "breakpoint edge, short"],
  [768, 1024, "iPad portrait"],
];

function constant(src, name) {
  const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*([0-9.]+)\\s*;`));
  if (!m) throw new Error(`could not find ${name} in ${COMPONENT}`);
  return Number(m[1]);
}

const src = await readFile(COMPONENT, "utf8");
const L = constant(src, "MOBILE_DIAGONAL_LEFT");
const R = constant(src, "MOBILE_DIAGONAL_RIGHT");
const FEET = constant(src, "MOBILE_FEET_Y");
const MAX_H = constant(src, "MOBILE_MAX_HEIGHT");
const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));

/** Topmost silhouette row per column, as a fraction of frame height (1 = no
 * silhouette in that column). */
async function skyline(index) {
  const file = `${FRAME_DIR}/${String(index).padStart(4, "0")}.webp`;
  const rows = Math.round((COLUMNS * manifest.height) / manifest.width);
  const { data, info } = await sharp(file)
    .resize(COLUMNS, rows)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tops = new Array(info.width).fill(1);
  for (let x = 0; x < info.width; x++) {
    for (let y = 0; y < info.height; y++) {
      const o = (y * info.width + x) * 3;
      if (data[o] < MAX_RED && data[o + 1] < MAX_GREEN) {
        tops[x] = y / info.height;
        break;
      }
    }
  }
  return tops;
}

const skylines = [];
for (let j = 0; j < manifest.count; j++) skylines.push(await skyline(j));

/** Mirrors drawMobile exactly; returns the smallest gap between any
 * silhouette pixel and the diagonal, in CSS pixels. */
function worstGap(cw, ch) {
  const scale = Math.min(cw / manifest.width, (ch * MAX_H) / manifest.height);
  const dw = manifest.width * scale;
  const dh = manifest.height * scale;
  const dx = (cw - dw) / 2;
  const dy = ch * FEET - dh * manifest.groundY;

  let gap = Infinity;
  let where = null;
  skylines.forEach((tops, j) => {
    tops.forEach((top, c) => {
      if (top >= 1) return;
      const t = c / (tops.length - 1);
      const onCanvas = (dx + t * dw) / cw;
      const diagonal = ch * (L + (R - L) * onCanvas);
      const g = dy + dh * top - diagonal;
      if (g < gap) {
        gap = g;
        where = j;
      }
    });
  });
  return { gap, frame: where, bandWidthPct: (dw / cw) * 100 };
}

console.log(
  `diagonal ${(L * 100).toFixed(0)}% -> ${(R * 100).toFixed(0)}% of viewport height, ` +
    `feet at ${(FEET * 100).toFixed(0)}%, band capped at ${(MAX_H * 100).toFixed(1)}% of height`,
);
console.log(`${manifest.count} frames at ${manifest.width}x${manifest.height}\n`);

let failed = false;
for (const [cw, ch, name] of VIEWPORTS) {
  const { gap, frame, bandWidthPct } = worstGap(cw, ch);
  const bad = gap < MIN_CLEARANCE_PX;
  if (bad) failed = true;
  console.log(
    `  ${name.padEnd(24)} ${String(cw).padStart(4)}x${String(ch).padStart(4)}  ` +
      `clearance ${(gap >= 0 ? "+" : "") + gap.toFixed(0)}px`.padEnd(20) +
      `athlete ${bandWidthPct.toFixed(0)}% of width   ` +
      (bad ? `FAIL (worst: frame ${frame})` : "ok"),
  );
}

if (failed) {
  console.error(
    `\nFAILED: the clip cuts the athlete, or comes within ${MIN_CLEARANCE_PX}px of it.\n` +
      `Lower MOBILE_MAX_HEIGHT, or move the diagonal down (raise ` +
      `MOBILE_DIAGONAL_LEFT/RIGHT), in ${COMPONENT}.`,
  );
  process.exit(1);
}
console.log("\nOK: the athlete clears the diagonal on every frame at every viewport.");
