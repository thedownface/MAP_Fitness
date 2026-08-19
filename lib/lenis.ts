"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let rafCallback: ((time: number) => void) | null = null;

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  rafCallback = (time: number) => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(rafCallback);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenis() {
  if (!lenis) return;
  if (rafCallback) gsap.ticker.remove(rafCallback);
  lenis.destroy();
  lenis = null;
  rafCallback = null;
}

export function getLenis() {
  return lenis;
}
