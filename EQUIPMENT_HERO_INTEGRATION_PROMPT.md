# Prompt: Replace the hero with a scroll-scrubbed equipment canvas

Paste everything below into a Claude Code session opened at `C:\Users\faiza\OneDrive\Desktop\MAP`.

---

## Objective

Replace the current Three.js "Reach Your Peak" mountain-climb hero
(`components/ui/horizon-hero-section.tsx`) with a **canvas frame-scrubbing
hero**: a sequence of JPEG frames (gym equipment going from scattered to
organized) painted onto a `<canvas>`, where the current scroll position
picks which frame is drawn — the same technique used on the Royal Pop
(Audemars Piguet × Swatch) scroll site, adapted to this app's existing
architecture. **Do not** port that technique's raw HTML/CSS/JS wholesale —
this codebase already has its own conventions for every piece involved
(scroll, motion, preloading, reduced motion). Follow them.

## Hard constraints — read the existing code before writing anything

This app already has significant scroll/animation infrastructure. Read
these files first; do not duplicate what they already do:

| File | What it already does | Rule |
|---|---|---|
| `lib/lenis.ts` | Singleton Lenis instance, wired to `gsap.ticker` | Never call `new Lenis()` again. It's already running site-wide via `SmoothScrollProvider`. |
| `lib/gsap.ts` | `gsap` + `ScrollTrigger`, already registered | Import `{ gsap, ScrollTrigger }` from here, don't re-register the plugin. |
| `components/layout/SmoothScrollProvider.tsx` | Initializes Lenis in `RootLayout`, skips it under reduced motion | Don't add a second scroll provider. |
| `lib/useReducedMotion.ts` | `useReducedMotion()` hook (media query) | Use this, not a new implementation. |
| `components/layout/Preloader.tsx` | Waits for **`document.querySelector(".hero-canvas")`** to exist, then for a **`window.dispatchEvent(new Event("map:hero-ready"))`** event, with a 6s hard timeout | Your new hero's `<canvas>` **must** keep the class `hero-canvas`, and you **must** dispatch `"map:hero-ready"` once the first frame is actually painted. If you skip this, the preloader will hang for the full 6s on every load. |
| `app/globals.css` | Real brand tokens (see below) | Use these exact tokens. Do not invent new colors/fonts. |
| `lib/constants.ts` | `BRAND`, single source of truth for copy | Pull hero copy from here (`BRAND.tagline`, `BRAND.campaignLine`, `BRAND.fullName`), don't invent new lines. |

**Brand tokens (`app/globals.css`):**
- `--color-midnight: #0a0b0b` (background)
- `--color-crimson: #de1f26` (accent)
- `--color-cool-white: #e9f0f5` (primary text)
- `--color-cool-grey: #dcdcdc` (secondary text)
- `--font-display: var(--font-archivo), "Arial Narrow", sans-serif`
- `--ease-map: cubic-bezier(0.65, 0, 0.35, 1)`

## Scope boundary — replace the hero only, nothing downstream

`app/page.tsx` composes the homepage as: Hero → `ScrollDiscoverSection` →
`StrengthFlexibilitySection` → Recovery → Marquee → Training → Community →
`FinalPeakSection` → `CTASection`. **Only the hero changes.** Everything
from `ScrollDiscoverSection` down already has its own scroll-reveal
treatment (the `Reveal` component) and must not be touched or restructured.

Specifically:
- Do **not** build one giant `#scroll-container` that swallows the rest of
  the page's sections into `data-enter`/`data-leave` overlays (that's how
  the vanilla Royal Pop site works — it doesn't fit this codebase, which
  already tells its "Recovery / Move / Community / Membership" story in
  separate, already-built components below the hero).
- The new hero must be **self-contained**: a tall spacer element with a
  `position: fixed` canvas that hands off cleanly to normal document flow
  once its own scroll range ends — exactly like the current hero already
  does (see `.hero-canvas` / `.hero-blackout` + the `pastHeroDisplay`
  motion value in `horizon-hero-section.tsx`, and the matching comments in
  `horizon-hero-section.css` explaining why `position: fixed` + a
  JS-driven `display` toggle was chosen over `position: sticky`). Reuse
  that exact pattern.
- Leave `app/horizon-hero-demo/page.tsx` and
  `components/ui/horizon-hero-section-demo.tsx` alone — that's an isolated
  demo route, not linked from the main nav. It can keep importing the old
  Three.js component; don't delete `horizon-hero-section.tsx`/`.css`, just
  stop importing it from `app/page.tsx`.

## Architecture to follow (mirrors the current hero's own pattern)

The current hero drives **everything** off one `useScroll({ target:
containerRef, offset: ["start start", "end end"] })` motion value, read
imperatively via `useMotionValueEvent(scrollYProgress, "change", fn)` —
never `setState` on scroll, since that would force a full React re-render
per scroll tick (see the detailed comment at the top of
`horizon-hero-section.tsx`). **Do the same thing for frame selection**:
compute `frameIndex = Math.min(Math.floor(progress * FRAME_COUNT),
FRAME_COUNT - 1)` inside that same imperative callback and draw straight
to the canvas — no GSAP `ScrollTrigger.create({ onUpdate })`, no second
scroll-tracking system fighting Framer Motion's.

Build `components/ui/equipment-hero-section.tsx` (+ a sibling
`.css` file) with roughly this shape:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useReducedMotion";
import "./equipment-hero-section.css";

const FRAME_COUNT = 262; // match whatever ships in public/frames — see below
const IMAGE_SCALE = 0.85;

export function EquipmentHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const bgColorRef = useRef("#0a0b0b");
  const currentFrameRef = useRef(-1);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const pastHeroDisplay = useTransform(scrollYProgress, (v) => (v >= 1 ? "none" : "block"));
  const blackoutOpacity = useTransform(scrollYProgress, [0.92, 1], [0, 1]);

  // Preload frames, draw frame 0, dispatch "map:hero-ready" — same
  // readiness contract the old Three.js hero used, so Preloader.tsx
  // doesn't need to change at all.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    sizeCanvas();

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      if (!img) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.fillStyle = bgColorRef.current;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    let cancelled = false;
    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => { framesRef.current[i] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
      });

    (async () => {
      // First frame blocks paint; the rest stream in behind it.
      await loadFrame(0);
      if (cancelled) return;
      drawFrame(0);
      window.dispatchEvent(new Event("map:hero-ready"));

      const rest = [];
      for (let i = 1; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
      await Promise.all(rest);
    })();

    const onResize = () => { sizeCanvas(); drawFrame(Math.max(0, currentFrameRef.current)); };
    window.addEventListener("resize", onResize);
    return () => { cancelled = true; window.removeEventListener("resize", onResize); };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reducedMotion) return; // static last-loaded frame only, matches the
                                // old hero's "skip camera flythrough" rule
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const index = Math.min(Math.floor(progress * FRAME_COUNT), FRAME_COUNT - 1);
    if (index === currentFrameRef.current) return;
    currentFrameRef.current = index;
    const img = framesRef.current[index];
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  });

  return (
    <div ref={containerRef} className="hero-container">
      <motion.canvas ref={canvasRef} className="hero-canvas" style={{ display: pastHeroDisplay }} />
      <motion.div className="hero-blackout" style={{ opacity: blackoutOpacity, display: pastHeroDisplay }} aria-hidden />

      <div className="hero-content">
        <span className="hero-overline font-display">{BRAND.fullName}</span>
        <motion.h1 className="hero-headline" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 0.15 }}>
          The Next <span className="text-crimson">Level.</span>
        </motion.h1>
        <motion.p className="hero-tagline" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.35 }}>
          {BRAND.campaignLine}
        </motion.p>
        <motion.div className="hero-cta" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }}>
          <Button href="/about" variant="ghost">Explore MAP →</Button>
        </motion.div>
      </div>
    </div>
  );
}
```

Notes on the skeleton above — adapt, don't copy blindly:
- It intentionally has **no extra `.content-section` "beat" text** inside
  the hero (unlike the old mountain hero's single "The Climb" beat). The
  rest of the page already narrates Recovery/Move/Community/Membership —
  duplicating that inside the hero too is redundant. If you want one beat
  section for pacing, keep it to one, reuse the existing `.beat-eyebrow` /
  `.beat-text` / `.beat-subtext` CSS classes from
  `horizon-hero-section.css` (copy them into the new CSS file), and source
  copy from `BRAND`, not invented text.
- `equipment-hero-section.css` should mirror `horizon-hero-section.css`
  structurally (`.hero-container`, `.hero-canvas`, `.hero-blackout`,
  `.hero-content`, `.hero-overline`, `.hero-headline`, `.hero-cta`) so the
  visual rhythm (font sizes, glow, spacing) stays consistent with the rest
  of the site. Reuse those class names and values; only change what
  content-wise must change.
- `FRAME_COUNT` must match the actual number of files in `public/frames/`
  — verify with a directory listing before hardcoding it.

Then update `app/page.tsx`:
```diff
- import { Component as HeroSection } from "@/components/ui/horizon-hero-section";
+ import { EquipmentHeroSection } from "@/components/ui/equipment-hero-section";
  ...
-     <HeroSection />
+     <EquipmentHeroSection />
```

## Frame source

**No real MAP-branded transformation video exists yet.** Two paths, pick
based on what's available when you run this:

### Path A — placeholder (works today, no external tools)

Build a synthetic Ken Burns + crossfade clip from two images already in
this repo (`public/images/hero/hero-main.jpg` and
`public/images/hero/deadlift.jpg` — both dark, moody gym stock photography
already used elsewhere on the site, so tonally consistent), extract frames
with `ffmpeg`, and drop them straight into `public/frames/`:

```bash
mkdir -p public/frames
ffmpeg -y \
  -loop 1 -t 9 -i public/images/hero/hero-main.jpg \
  -loop 1 -t 9 -i public/images/hero/deadlift.jpg \
  -filter_complex "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,zoompan=z='min(zoom+0.0015,1.2)':d=1:s=1280x720:fps=24[v0];[1:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,zoompan=z='min(zoom+0.0015,1.2)':d=1:s=1280x720:fps=24[v1];[v0][v1]xfade=transition=fade:duration=2:offset=7[vout]" \
  -map "[vout]" -r 24 /tmp/map-hero-placeholder.mp4
ffmpeg -y -i /tmp/map-hero-placeholder.mp4 -vf "fps=16,scale=1280:-1" -q:v 4 "public/frames/frame_%04d.jpg"
ls public/frames | wc -l   # use this number as FRAME_COUNT
```

A pre-built placeholder sequence (262 frames, same technique, different
source stills) already exists at
`C:\Users\faiza\OneDrive\Desktop\MAP Fitness Scroll\frames\` if you'd
rather copy that instead of regenerating it.

### Path B — real AI-generated video (once it exists)

The user will generate a real "scattered gym equipment assembling into an
organized MAP training floor" video externally (Veo/Sora/Runway/Kling),
using the prompt in
`C:\Users\faiza\OneDrive\Desktop\MAP Fitness Scroll\PROMPT.md` — **update
that prompt's color references from `#e31e24`/`#0a0a0a` to this site's
real tokens, `#de1f26`/`#0a0b0b`, before using it**, and use
`public/images/hero/hero-main.jpg` / `deadlift.jpg` as its two reference
stills instead of generic stock. Once the `.mp4` exists:

```bash
rm -f public/frames/*.jpg
ffmpeg -i /path/to/real-video.mp4 -vf "fps=16,scale=1280:-1" -q:v 4 "public/frames/frame_%04d.jpg"
```

Update `FRAME_COUNT` in `equipment-hero-section.tsx` to match. No other
code changes needed — same component, same integration.

## Verification (do this before calling it done)

1. `npm run dev`, open the homepage.
2. Confirm the Preloader dismisses normally (not stuck for the full 6s
   timeout) — this proves `"map:hero-ready"` fired correctly.
3. Scroll through the hero: frames should visibly change with scroll
   position; once past the hero, the canvas must fully disappear (no
   full-viewport black rectangle bleeding into `ScrollDiscoverSection`).
4. Emulate `prefers-reduced-motion: reduce` in devtools — canvas should
   hold a single static frame, no scroll-driven redraws, headline/tagline
   should appear without the fade-in.
5. Check the browser console for errors on load and throughout scroll.
6. Resize the window / test at a mobile viewport — canvas must resize
   without distortion, text must stay legible.
7. `npm run build` — must complete with no type errors.
8. Confirm `ScrollDiscoverSection` and everything below it still render
   and animate exactly as before (you didn't touch those files, but verify
   the handoff from the new hero into them is visually clean — no gap, no
   overlap).
