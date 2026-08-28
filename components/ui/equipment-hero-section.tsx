"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { RECOVERY_FEATURES, COMMUNITY_BANNER, TRAINING_MODALITIES } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useHasMounted } from "@/lib/useHasMounted";
import "./equipment-hero-section.css";

// public/athlete currently holds 002.png through 480.png (479 files, no
// 001.png) — shifted by one so index 0 resolves to the first file that
// actually exists. If a fuller replacement set lands in this folder later,
// update FRAME_COUNT/FRAME_PATH to match whatever's actually on disk.
const FRAME_COUNT = 479;
const FRAME_PATH = (i: number) => `/athlete/${String(i + 2).padStart(3, "0")}.png`;
const IMAGE_SCALE = 1;
// Matches the .hero-canvas media query breakpoint (max-width: 768px) in
// equipment-hero-section.css.
const MOBILE_BREAKPOINT = 768;
// Horizontal anchor for drawImage's cover-fit crop: 0 = left edge of the
// frame shown, 0.5 = centered, 1 = right edge. The canvas itself is already
// confined to a right-hand column on desktop (see the CSS media query on
// .hero-canvas), so this only needs to add a small further nudge — drifted
// toward as the user scrolls, so the athlete visibly settles rightward
// rather than sitting static. Mobile has no side column (full-bleed,
// centered canvas), so it stays centered here too.
const ANCHOR_MOBILE = 0.5;
const ANCHOR_DESKTOP_BASE = 0.5;
const ANCHOR_DESKTOP_MAX = 0.64;
const ANCHOR_SCROLL_WINDOW = 0.06;

function computeAnchorX(isMobile: boolean, progress: number) {
  if (isMobile) return ANCHOR_MOBILE;
  const t = Math.max(0, Math.min(1, progress / ANCHOR_SCROLL_WINDOW));
  return ANCHOR_DESKTOP_BASE + (ANCHOR_DESKTOP_MAX - ANCHOR_DESKTOP_BASE) * t;
}

type Side = "left" | "right";

// `heading` must contain `accent` verbatim once — the render below splits
// on it to color that one word, the same "single accent word" rule
// .hero-headline follows for "Limit".
const BEATS: Array<{
  index: string;
  label: string;
  heading: string;
  accent: string;
  body: string;
  side: Side;
  enter: number;
  leave: number;
}> = [
  {
    index: "01",
    label: "Move",
    heading: "Train Like An Athlete.",
    accent: "Athlete",
    body: TRAINING_MODALITIES.slice(0, 4)
      .map((m) => m.title)
      .join(". ") + ".",
    side: "left",
    enter: 0.24,
    leave: 0.4,
  },
  {
    index: "02",
    label: "Recover",
    heading: "Recover Like A Pro.",
    accent: "Recover",
    body: RECOVERY_FEATURES.map((f) => f.title).join(". ") + ".",
    // `side` only picks the slide-in direction (useBeatMotion) — every beat
    // still *settles* in the left column (all three render
    // .hero-beat.align-left below; the athlete's wedge on the right is his
    // alone, never text).
    side: "right",
    enter: 0.49,
    leave: 0.64,
  },
  {
    index: "03",
    label: "Belong",
    heading: "This Is MAP.",
    accent: "MAP",
    body: COMMUNITY_BANNER,
    side: "left",
    enter: 0.73,
    leave: 0.89,
  },
];

/** Opacity fades in/out across [enter, leave]; x slides in from `side` only
 * during the enter fade, then holds at 0 — same enter/leave-window pattern
 * Royal Pop drives its per-section text with, expressed as Framer Motion
 * transforms instead of a manual onUpdate/GSAP timeline so it matches how
 * the rest of this hero (and the mountain hero it replaced) already reads
 * scroll: everything off one scrollYProgress motion value, no setState.
 *
 * `filter` adds the pause.co.in-style motion-blur-in: each beat starts
 * heavily blurred and resolves to sharp focus over the same enter window
 * the slide plays over (confirmed by diffing their site's settled vs.
 * transitioning frames — the blur is transition-only, gone once a chapter
 * is fully in view), and re-blurs slightly on the way out so the next
 * beat's crossfade reads as one chapter dissolving into the next rather
 * than a hard cut. */
function useBeatMotion(
  scrollYProgress: MotionValue<number>,
  enter: number,
  leave: number,
  side: Side,
  reducedMotion: boolean,
) {
  const fade = 0.04;
  const opacity = useTransform(scrollYProgress, [enter - fade, enter, leave, leave + fade], [0, 1, 1, 0]);
  const rawX = useTransform(scrollYProgress, [enter - fade, enter], [side === "left" ? -70 : 70, 0]);
  const x = useTransform(rawX, (v) => (reducedMotion ? 0 : v));
  const rawBlur = useTransform(
    scrollYProgress,
    [enter - fade, enter, leave, leave + fade],
    [10, 0, 0, 6],
  );
  const filter = useTransform(rawBlur, (v) => `blur(${reducedMotion ? 0 : v}px)`);
  return { opacity, x, filter };
}

export function EquipmentHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  // Fallback fill behind the frame — matches the athlete sequence's solid
  // red backdrop. With IMAGE_SCALE=1 (true cover) this is only ever visible
  // for a sub-pixel rounding edge, but it should still match the footage
  // rather than the old midnight fallback that suited the equipment shots.
  const bgColorRef = useRef("#c21300");
  const currentFrameRef = useRef(-1);
  // Set inside the mount effect below (it closes over the canvas/ctx sized
  // there); the scroll handler calls through this ref instead of
  // duplicating the draw logic or re-creating the effect per scroll tick.
  const drawFrameRef = useRef<(index: number) => void>(() => {});
  // Horizontal cover-fit anchor (see computeAnchorX) plus the inputs needed
  // to recompute it outside the scroll handler — on resize (a breakpoint
  // crossing changes isMobile) and read back when a resize fires with no
  // scroll change in between.
  const anchorXRef = useRef(ANCHOR_DESKTOP_BASE);
  const isMobileRef = useRef(false);
  const lastProgressRef = useRef(0);
  const reducedMotion = useReducedMotion();

  // Framer Motion server-renders using the `animate` values, not `initial`
  // (so no-JS/slow-hydration users see the correct final layout rather than
  // hidden/offset text) — then, on hydrate, if the DOM already matches
  // `animate`, it skips the enter transition entirely rather than replaying
  // it. That made every "slide in" here a no-op: the SSR HTML already had
  // opacity:1/transform:none baked in, so hydration had nothing to animate
  // toward. Gating `animate` on a state flip that only happens client-side,
  // after mount, forces a genuine post-mount prop change, which Framer
  // Motion always animates regardless of what SSR produced.
  const mounted = useHasMounted();
  const entered = mounted || reducedMotion;

  // Same imperative, no-setState scroll pattern as the mountain hero this
  // replaces (see horizon-hero-section.tsx) — a scroll-linked motion value
  // read via useMotionValueEvent, never React state, so frame changes never
  // trigger a re-render.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const pastHeroDisplay = useTransform(scrollYProgress, (v) => (v >= 1 ? "none" : "block"));
  // Starts the instant beat 3 finishes fading out (enter/leave above put
  // that at progress ~0.93) so the blackout picks up where the last beat's
  // own fade-out left off, rather than leaving a silent stretch of plain
  // frame-scrub in between — that gap was the dead black space before this
  // was tuned.
  const blackoutOpacity = useTransform(scrollYProgress, [0.93, 1], [0, 1]);

  // Called a fixed 3 times (one per BEATS entry) in the same order every
  // render, same as any other hook — not looped via BEATS.map(), which
  // would make the call count depend on runtime data instead of source order.
  const beat0 = useBeatMotion(scrollYProgress, BEATS[0].enter, BEATS[0].leave, BEATS[0].side, reducedMotion);
  const beat1 = useBeatMotion(scrollYProgress, BEATS[1].enter, BEATS[1].leave, BEATS[1].side, reducedMotion);
  const beat2 = useBeatMotion(scrollYProgress, BEATS[2].enter, BEATS[2].leave, BEATS[2].side, reducedMotion);
  const beatMotions = [beat0, beat1, beat2];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Sized from the canvas's own rendered CSS box (not window.innerWidth)
    // so the drawing buffer follows whatever width the stylesheet currently
    // gives it — full-bleed on mobile, confined to the right-hand column on
    // desktop (see the media query on .hero-canvas). Deliberately doesn't
    // set canvas.style.width/height: an inline style would outrank that
    // stylesheet rule and pin the box to whichever size was measured first,
    // never picking up a later breakpoint change.
    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width || window.innerWidth;
      const cssHeight = rect.height || window.innerHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      isMobileRef.current = window.innerWidth <= MOBILE_BREAKPOINT;
    };
    sizeCanvas();
    anchorXRef.current = computeAnchorX(isMobileRef.current, lastProgressRef.current);

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.fillStyle = bgColorRef.current;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) * (1 - anchorXRef.current), (ch - dh) / 2, dw, dh);
    };
    drawFrameRef.current = drawFrame;

    let cancelled = false;
    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          framesRef.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = FRAME_PATH(i);
      });

    (async () => {
      // First frame blocks paint and fires readiness; the rest stream in
      // behind it. Preloader.tsx waits on both ".hero-canvas" existing and
      // this "map:hero-ready" event — the same contract the old Three.js
      // hero used, so Preloader needs no changes.
      await loadFrame(0);
      if (cancelled) return;
      currentFrameRef.current = 0;
      drawFrame(0);
      window.dispatchEvent(new Event("map:hero-ready"));

      const rest: Promise<void>[] = [];
      for (let i = 1; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
      await Promise.all(rest);
    })();

    const onResize = () => {
      sizeCanvas();
      anchorXRef.current = computeAnchorX(isMobileRef.current, lastProgressRef.current);
      drawFrame(Math.max(0, currentFrameRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Reduced motion: hold whatever frame is currently painted, matching
    // the old hero's rule of skipping scroll-linked camera movement.
    if (reducedMotion) return;
    lastProgressRef.current = progress;
    const index = Math.min(Math.floor(progress * FRAME_COUNT), FRAME_COUNT - 1);
    const nextAnchor = computeAnchorX(isMobileRef.current, progress);
    const anchorChanged = Math.abs(nextAnchor - anchorXRef.current) > 0.001;
    if (index === currentFrameRef.current && !anchorChanged) return;
    currentFrameRef.current = index;
    anchorXRef.current = nextAnchor;
    drawFrameRef.current(index);
  });

  return (
    <div ref={containerRef} className="hero-container">
      <motion.canvas ref={canvasRef} className="hero-canvas" style={{ display: pastHeroDisplay }} />

      <motion.div
        className="hero-blackout"
        style={{ opacity: blackoutOpacity, display: pastHeroDisplay }}
        aria-hidden
      />

      {BEATS.map((beat, i) => (
        <motion.div
          key={beat.index}
          className="hero-beat align-left"
          style={{ opacity: beatMotions[i].opacity }}
        >
          <span className="hero-beat-numeral font-display" aria-hidden>
            {beat.index}
          </span>
          <motion.div
            className="hero-beat-inner"
            style={{ x: beatMotions[i].x, filter: beatMotions[i].filter }}
          >
            <span className="section-label font-display">
              {beat.index} / {beat.label}
            </span>
            <h2 className="beat-heading font-display">
              {beat.heading.split(beat.accent).map((part, j, parts) => (
                <span key={j}>
                  {part}
                  {j < parts.length - 1 && <span className="hero-headline-accent">{beat.accent}</span>}
                </span>
              ))}
            </h2>
            <p className="beat-body">{beat.body}</p>
          </motion.div>
        </motion.div>
      ))}

      <div className="hero-content">
        {/* One headline, one message — "Limit" is the only accent color in
            the whole hero, so it actually reads as emphasis instead of
            competing with a separate overline + tagline saying similar
            things in three different places. */}
        <h1 className="hero-headline">
          <motion.span
            style={{ display: "inline-block", marginRight: "0.28em" }}
            initial={{ opacity: 0, x: -80, filter: "blur(12px)" }}
            animate={
              entered
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: -80, filter: "blur(12px)" }
            }
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.15 }}
          >
            Your
          </motion.span>
          <motion.span
            className="hero-headline-accent"
            style={{ display: "inline-block", marginRight: "0.28em" }}
            initial={{ opacity: 0, x: 80, filter: "blur(12px)" }}
            animate={
              entered
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: 80, filter: "blur(12px)" }
            }
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.3 }}
          >
            Limit
          </motion.span>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={
              entered
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 24, filter: "blur(10px)" }
            }
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.45 }}
          >
            Is You.
          </motion.span>
        </h1>
      </div>

      <div className="hero-scroll-spacer" aria-hidden />
    </div>
  );
}
