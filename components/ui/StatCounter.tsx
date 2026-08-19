"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type StatCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export function StatCounter({ value, suffix = "", prefix = "", label }: StatCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    if (reducedMotion) {
      el.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const counter = { current: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          current: value,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(counter.current)}${suffix}`;
          },
        });
      },
    });

    return () => trigger.kill();
  }, [value, suffix, prefix, reducedMotion]);

  return (
    <div className="flex flex-col gap-2">
      <span ref={numberRef} className="font-display text-5xl text-crimson sm:text-6xl">
        {prefix}0{suffix}
      </span>
      <span className="font-body text-sm uppercase tracking-[0.2em] text-cool-grey">{label}</span>
    </div>
  );
}
