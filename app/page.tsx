import Image from "next/image";
import { Component as HeroSection } from "@/components/ui/horizon-hero-section";
import { SectionTag } from "@/components/ui/SectionTag";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { RecoveryBento } from "@/components/ui/RecoveryBento";
import { Marquee } from "@/components/ui/Marquee";
import { CTASection } from "@/components/ui/CTASection";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ScrollDiscoverSection } from "@/components/sections/ScrollDiscoverSection";
import { StrengthFlexibilitySection } from "@/components/sections/StrengthFlexibilitySection";
import { FinalPeakSection } from "@/components/sections/FinalPeakSection";
import {
  RECOVERY_FEATURES,
  RECOVERY_INTRO,
  TRAINING_MODALITIES,
  COMMUNITY_ZONES,
  COMMUNITY_COPY,
  COMMUNITY_BANNER,
  BRAND,
  MEMBERSHIP_CTA,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <ScrollDiscoverSection />

      <StrengthFlexibilitySection />

      {/* Recovery floor */}
      <section id="recovery" className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4" start="top 100%">
          <SectionTag index="03" label="Recovery" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Recover on <span className="text-crimson">Purpose</span>
          </h2>
          <p className="max-w-xl text-cool-grey">{RECOVERY_INTRO}</p>
        </Reveal>

        <RecoveryBento items={RECOVERY_FEATURES} />
      </section>

      <Marquee text={BRAND.campaignLine} />

      {/* Training modalities */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="04" label="Training" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Every Way You <span className="text-crimson">Move</span>
          </h2>
        </Reveal>

        <FeatureGrid items={TRAINING_MODALITIES} columns={3} className="mt-12" />
      </section>

      {/* Community */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="05" label="Community" />
          <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Not Just a Fitness Club. <span className="text-crimson">A Community.</span>
          </h2>
          <p className="max-w-xl text-cool-grey">{COMMUNITY_COPY}</p>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COMMUNITY_ZONES.map((zone) => (
            <div key={zone.title} className="duotone relative aspect-[3/4] overflow-hidden rounded-sharp">
              <Image
                src={zone.image}
                alt={zone.title}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
              <span className="absolute bottom-4 left-4 z-10 bg-crimson px-3 py-1 font-display text-xs uppercase tracking-widest text-midnight">
                {zone.title}
              </span>
            </div>
          ))}
        </Reveal>

        <DoubleRuleDivider className="mt-16" />
        <Reveal className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="font-display text-xl uppercase leading-tight text-cool-white sm:text-2xl">
            {COMMUNITY_BANNER}
          </p>
          <Button href="/pricing" variant="pill">
            View Membership
          </Button>
        </Reveal>
      </section>

      <FinalPeakSection />

      <CTASection headline={MEMBERSHIP_CTA.headline} subline={MEMBERSHIP_CTA.subline} />
    </>
  );
}
