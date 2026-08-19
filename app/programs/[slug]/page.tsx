import Image from "next/image";
import { notFound } from "next/navigation";
import { PROGRAM_ANIMATIONS } from "@/components/animations/registry";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { FeatureTable } from "@/components/ui/FeatureTable";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";
import { PROGRAM_DETAILS, TRAINING_MODALITIES, type ProgramSlug } from "@/lib/constants";

export async function generateStaticParams() {
  return Object.keys(PROGRAM_DETAILS).map((slug) => ({ slug }));
}

function getProgram(slug: string) {
  if (!(slug in PROGRAM_DETAILS)) return null;
  return PROGRAM_DETAILS[slug as ProgramSlug];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return {
    title: `${program.title} — MAP Fitness`,
    description: program.overview,
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const modality = TRAINING_MODALITIES.find((m) => m.animation === slug);
  const Scene = PROGRAM_ANIMATIONS[slug as keyof typeof PROGRAM_ANIMATIONS];
  const otherPrograms = TRAINING_MODALITIES.filter((m) => m.animation !== slug);

  return (
    <>
      {/* Banner */}
      <section className="relative flex h-[70vh] min-h-[480px] w-full items-end overflow-hidden">
        <Image
          src={program.heroImage}
          alt={`${program.title} training at MAP`}
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-midnight/10" />
        <div className="relative z-10 flex w-full flex-col gap-3 px-6 pb-16 sm:px-10">
          <SectionTag index={modality?.index ?? "01"} label="Programs" />
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] text-cool-white sm:text-7xl">
            {program.title}
          </h1>
          <p className="max-w-xl text-lg text-cool-grey">{program.tagline}</p>
        </div>
      </section>

      {/* Overview + live demo */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-section-y-sm sm:px-10 sm:py-section-y lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal stagger className="flex flex-col gap-8">
          <p className="text-lg leading-relaxed text-cool-grey sm:text-xl">{program.overview}</p>
          <ul className="flex flex-col gap-3">
            {program.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-cool-grey">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-crimson" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          {Scene ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-sharp bg-midnight-soft">
              <Scene />
            </div>
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-sharp">
              <Image
                src={program.heroImage}
                alt={`${program.title} at MAP`}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover grayscale"
              />
            </div>
          )}
        </Reveal>
      </section>

      {/* Quick facts */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <DoubleRuleDivider className="mb-12" />
        <Reveal>
          <FeatureTable rows={program.stats} />
        </Reveal>
      </section>

      {/* Train it at MAP */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-6 rounded-sharp border border-cool-grey/15 bg-midnight-soft p-8 sm:p-12">
          <SectionTag label="Train It At MAP" />
          <p className="max-w-2xl text-lg leading-relaxed text-cool-grey">{program.atMap}</p>
          <div>
            <Button href="/pricing" variant="sharp">
              View Pricing
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Other ways to move */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag label="More Ways To Move" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Every Other <span className="text-crimson">Discipline</span>
          </h2>
        </Reveal>

        <FeatureGrid items={otherPrograms} columns={3} className="mt-12" />
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
