import Image from "next/image";
import { BRAND, RECOVERY_FEATURES, TRAINING_MODALITIES, MEMBERSHIP_ECOSYSTEM } from "@/lib/constants";
import { SectionTag } from "@/components/ui/SectionTag";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { CTASection } from "@/components/ui/CTASection";
import { MapWordmarkSVG } from "@/components/brand/MapWordmarkSVG";

export const metadata = {
  title: "About — MAP Fitness",
  description: "The story behind MAP: a gym built on the balance of rigidity and range.",
};

export default function AboutPage() {
  return (
    <>
      {/* Banner */}
      <section className="relative flex h-[70vh] min-h-[480px] w-full items-end overflow-hidden">
        <Image
          src="/images/about/portrait.jpg"
          alt="Athlete training at MAP"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-midnight/10" />
        <div className="relative z-10 flex w-full flex-col gap-3 px-6 pb-16 sm:px-10">
          <SectionTag index="01" label="About MAP" />
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] text-cool-white sm:text-7xl">
            Built Between Two Forces
          </h1>
        </div>
      </section>

      {/* Brand story */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-section-y-sm sm:px-10 sm:py-section-y lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal stagger className="flex flex-col gap-6">
          {BRAND.story.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-cool-grey first:font-display first:text-2xl first:uppercase first:leading-snug first:tracking-tight first:text-cool-white sm:first:text-3xl">
              {paragraph}
            </p>
          ))}
        </Reveal>

        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-sharp">
          <Image
            src="/images/about/rig.jpg"
            alt="MAP training rig"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover grayscale"
          />
        </Reveal>
      </section>

      {/* Logo meaning */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <DoubleRuleDivider className="mb-16" />
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <MapWordmarkSVG className="h-24 w-auto sm:h-32" strokeWidth={16} />
          </Reveal>
          <Reveal className="flex flex-col gap-4">
            <SectionTag index="02" label="Rigidity / Range" />
            <p className="max-w-lg text-lg leading-relaxed text-cool-grey">{BRAND.logoMeaning}</p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal stagger className="grid grid-cols-1 gap-10 border-t border-cool-grey/15 pt-12 sm:grid-cols-3">
          <StatCounter value={TRAINING_MODALITIES.length} label="Training Disciplines" />
          <StatCounter value={RECOVERY_FEATURES.length} label="Recovery Therapies" />
          <StatCounter value={MEMBERSHIP_ECOSYSTEM.length} label="Membership Benefits" />
        </Reveal>
      </section>

      {/* Secondary image band */}
      <section className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {["/images/about/detail.jpg", "/images/about/dumbbell-bw.jpg", "/images/hero/deadlift.jpg", "/images/community/red-machine.jpg"].map(
          (src) => (
            <div key={src} className="duotone relative aspect-square overflow-hidden">
              <Image src={src} alt="MAP training" fill sizes="25vw" className="object-cover" />
            </div>
          ),
        )}
      </section>

      <CTASection
        headline="Train With Purpose"
        subline="Strength and flexibility, built together — see the programs that make it happen."
        ctaLabel="Explore Programs"
        ctaHref="/programs"
      />
    </>
  );
}
