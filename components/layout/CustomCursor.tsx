"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabled = !useMediaQuery("(pointer: coarse)");
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const ringPos = { x: 0, y: 0 };
    let raf: number;

    const onMove = (e: MouseEvent) => {
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY });
      ringPos.x = e.clientX;
      ringPos.y = e.clientY;

      const target = (e.target as HTMLElement)?.closest("[data-cursor='link']");
      setHovering(Boolean(target));
    };

    const tick = () => {
      gsap.to(ringRef.current, { x: ringPos.x, y: ringPos.y, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2 rounded-full border border-crimson transition-[width,height,opacity] duration-300 ease-map ${
          hovering ? "h-12 w-12 opacity-100" : "h-7 w-7 opacity-60"
        }`}
      />
    </>
  );
}
