"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

const LOGO_MASK_URL = "/images/map-logo-mark.png";
const FILL_DURATION = 5;

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // The browser's own scroll restoration would otherwise reopen a reload
    // at whatever position the last visit left off at — this always shows
    // the page from the hero, every reload, not wherever the scrollbar was.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion || !containerRef.current || !fillRef.current) return;
    const container = containerRef.current;
    const fill = fillRef.current;

    // Only the home page's WebGL hero needs to be waited on — everywhere
    // else there's nothing to hold for, so behave exactly like before.
    const hasHero = !!document.querySelector(".hero-canvas");
    let fillDone = false;
    let heroReady = !hasHero;
    let settled = false;

    const finish = () => {
      if (settled || !fillDone || !heroReady) return;
      settled = true;
      gsap.to(container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => setVisible(false),
      });
    };

    const onHeroReady = () => {
      heroReady = true;
      finish();
    };
    window.addEventListener("map:hero-ready", onHeroReady);

    // Never hold the loader past this even if the hero never signals ready
    // (WebGL unsupported, a render error) — comfortably past a slow cold
    // GPU init, short enough not to read as broken.
    const maxWait = window.setTimeout(() => {
      heroReady = true;
      finish();
    }, 6000);

    // Rise the brand red up through the logo mark from a white base,
    // reading as the mark "filling up" while the 3D scene behind it
    // spins up, rather than appearing already-red (instant/static).
    const tl = gsap.timeline({
      onComplete: () => {
        fillDone = true;
        finish();
      },
    });
    tl.fromTo(
      fill,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: FILL_DURATION, ease: "power1.inOut" },
    );

    return () => {
      tl.kill();
      window.removeEventListener("map:hero-ready", onHeroReady);
      window.clearTimeout(maxWait);
    };
  }, [visible, reducedMotion]);

  useEffect(() => {
    document.documentElement.style.overflow = visible && !reducedMotion ? "hidden" : "";
  }, [visible, reducedMotion]);

  if (!visible || reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight"
      aria-hidden
    >
      <div
        className="relative h-40 aspect-[1856/2304] sm:h-56"
        style={{
          maskImage: `url(${LOGO_MASK_URL})`,
          WebkitMaskImage: `url(${LOGO_MASK_URL})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      >
        {/* Base coat: brand white, fully visible until the fill rises over it. */}
        <div className="absolute inset-0 bg-cool-white" />
        {/* Fill: brand red, clipped from the bottom and animated to full height. */}
        <div ref={fillRef} className="absolute inset-0 bg-crimson" style={{ clipPath: "inset(100% 0% 0% 0%)" }} />
      </div>
    </div>
  );
}
