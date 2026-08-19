"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MapWordmarkSVG } from "@/components/brand/MapWordmarkSVG";

const SESSION_KEY = "map-preloader-shown";

export function Preloader() {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    // One-shot imperative reveal gated on sessionStorage — not a
    // subscription to external state, so useSyncExternalStore doesn't
    // apply; there's no render-time-safe way to read sessionStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion || !containerRef.current || !wordmarkRef.current) return;
    const container = containerRef.current;
    const wordmark = wordmarkRef.current;

    const paths = container.querySelectorAll(".map-draw");
    // Only the home page's WebGL hero needs to be waited on — everywhere
    // else there's nothing to hold for, so behave exactly like before.
    const hasHero = !!document.querySelector(".hero-canvas");
    let drawDone = false;
    let heroReady = !hasHero;
    let settled = false;

    const finish = () => {
      if (settled || !drawDone || !heroReady) return;
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
    }, 4000);

    // Draw on white, then settle to the brand red — reads as the mark
    // "charging up" while the 3D scene behind it spins up, rather than
    // drawing on already-red (which reads as instant/static).
    const tl = gsap.timeline({
      onComplete: () => {
        drawDone = true;
        finish();
      },
    });
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power2.inOut",
    }).to(
      wordmark,
      {
        color: "#de1f26",
        duration: 0.6,
        ease: "power2.inOut",
      },
      "-=0.25",
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
      <MapWordmarkSVG ref={wordmarkRef} className="h-16 w-auto text-cool-white sm:h-20" animated strokeWidth={20} />
    </div>
  );
}
