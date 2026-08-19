"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export type EaseFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => {
    const m = t - 1;
    return m * m * m + 1;
  },
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} satisfies Record<string, EaseFn>;

const TARGET_FPS = 30;

/**
 * A self-looping authored clock for a small decorative scene: T sweeps
 * 0..duration and wraps. Paused (no state updates, so no re-render cost)
 * while off-screen via IntersectionObserver, and frozen at the midpoint
 * under prefers-reduced-motion — attach `ref` to the scene's root SVG.
 */
export function useLoopClock<El extends Element>(duration: number) {
  const ref = useRef<El>(null);
  const [time, setTime] = useState(0);
  const reducedMotion = useReducedMotion();
  const visible = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      // One-shot freeze on a media-query flip, not a per-render sync — same
      // pattern (and same justification) as Reveal's reduced-motion branch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTime(duration / 2);
      return;
    }
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    const frameLen = 1 / TARGET_FPS;
    const step = (ts: number) => {
      if (last == null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      if (visible.current) {
        acc += dt;
        if (acc >= frameLen) {
          setTime((prev) => (prev + acc) % duration);
          acc = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration, reducedMotion]);

  return { ref, T: time };
}
