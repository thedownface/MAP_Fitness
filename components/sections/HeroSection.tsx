"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BRAND } from "@/lib/constants";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image || reducedMotion) return;

    gsap.set(image, { scale: 1.15 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        gsap.set(image, { scale: 1.15 - self.progress * 0.15 });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-midnight">
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/hero/hero-main.jpg"
          alt="Athlete training at MAP"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center grayscale"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(222,31,38,0.16),transparent_65%)]"
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <span className="font-display text-xs uppercase tracking-[0.5em] text-crimson">
          {BRAND.fullName}
        </span>
        <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-tight text-cool-white sm:text-8xl lg:text-9xl">
          {BRAND.tagline}
        </h1>
        <p className="max-w-lg text-sm uppercase tracking-[0.3em] text-cool-grey sm:text-base">
          {BRAND.campaignLine}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Button href="/programs" variant="sharp">
            View Plans
          </Button>
          <Button href="/pricing" variant="pill">
            See Pricing
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-cool-grey">
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-cool-grey/60" />
      </div>
    </section>
  );
}
