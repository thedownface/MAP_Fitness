import Image from "next/image";
import { TRAINING_MODALITIES, RECOVERY_FEATURES, RECOVERY_INTRO } from "@/lib/constants";
import { SectionTag } from "@/components/ui/SectionTag";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { Reveal } from "@/components/ui/Reveal";
import { CTASection } from "@/components/ui/CTASection";

export const metadata = {
  title: "Programs — MAP Fitness",
  description:
    "Calisthenics, HYROX/Functional, MMA & Grappling, Pilates, new equipment and group classes — every way you move at MAP.",
};

export default function ProgramsPage() {
  return (
    <>
      {/* Banner */}
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-end overflow-hidden">
        <Image
          src="/images/programs/banner.jpg"
          alt="Training at MAP"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-midnight/10" />
        <div className="relative z-10 flex w-full flex-col gap-3 px-6 pb-16 sm:px-10">
          <SectionTag index="01" label="Programs" />
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] text-cool-white sm:text-7xl">
            Every Way You <span className="text-crimson">Move</span>
          </h1>
        </div>
      </section>

      {/* Modalities */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <FeatureGrid items={TRAINING_MODALITIES} columns={3} />
      </section>

      {/* Recovery */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="02" label="Recovery Floor" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Recover on <span className="text-crimson">Purpose</span>
          </h2>
          <p className="max-w-xl text-cool-grey">{RECOVERY_INTRO}</p>
        </Reveal>

        <FeatureGrid items={RECOVERY_FEATURES} columns={3} className="mt-12" />
      </section>

      <CTASection
        headline="Find Your Program"
        subline="Every discipline, one membership — see pricing and get started."
        ctaLabel="View Pricing"
        ctaHref="/pricing"
      />
    </>
  );
}
