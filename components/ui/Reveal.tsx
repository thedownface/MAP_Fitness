"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger children of the wrapper instead of animating the wrapper itself. */
  stagger?: boolean;
  delay?: number;
  y?: number;
  /** ScrollTrigger "start" position. Default "top 85%" reads well after a
   * normal static section above it, but right after the hero's own
   * scroll-driven animation, the extra scroll needed to reach 85% down the
   * viewport shows up as a dead gap between the hero ending and this
   * reveal firing — pass "top 100%" (fires as soon as it enters view) for
   * sections immediately following the hero. */
  start?: string;
};

/** Scroll-triggered fade/slide-up reveal — the workhorse section-entrance animation. */
export function Reveal({ children, className, stagger = false, delay = 0, y = 40, start = "top 85%" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : el;

    if (reducedMotion) {
      // useReducedMotion briefly reports false on the client (matching the
      // SSR snapshot) before correcting — if that first pass already hid
      // these targets, undo it here rather than just no-op-ing, or they'd
      // stay invisible forever once reducedMotion flips true.
      gsap.set(targets, { clearProps: "opacity,transform" });
      return;
    }

    gsap.set(targets, { opacity: 0, y });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.12 : 0,
        });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion, stagger, delay, y, start]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
