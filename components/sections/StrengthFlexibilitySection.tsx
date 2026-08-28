import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/constants";

const STRENGTH_TRAITS = ["Heavy", "Dense", "Rigid", "Powerful"] as const;
const FLEXIBILITY_TRAITS = ["Fluid", "Mobile", "Controlled", "Dynamic"] as const;

/** The brand's central philosophy, made an interactive moment rather than a
 * paragraph: two opposing forces, rendered with opposing visual language —
 * Strength in hard, square-cornered blocks (echoing the logo's M/P), Flexibility
 * in soft, rounded ones (echoing the logo's A) — then resolved into one word.
 * First section after the hero, so it opens the page's content rhythm. */
export function StrengthFlexibilitySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
      <Reveal className="flex flex-col gap-4" start="top 100%">
        <SectionTag index="02" label="Philosophy" />
        <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
          Two <span className="text-crimson">Forces.</span>
        </h2>
        <p className="max-w-xl text-cool-grey">{BRAND.story[1]}</p>
      </Reveal>

      <Reveal
        stagger
        start="top 100%"
        className="relative mt-12 grid grid-cols-1 overflow-hidden rounded-sharp border border-cool-grey/15 sm:grid-cols-[1fr_auto_1fr]"
      >
        {/* Strength — hard, square-cornered, rigid */}
        <div className="group relative flex flex-col gap-8 overflow-hidden bg-midnight-soft p-8 sm:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(222,31,38,0.16),transparent_55%)] transition-opacity duration-500 group-hover:opacity-150"
          />
          <div aria-hidden className="absolute -left-6 -top-6 h-24 w-24 border border-crimson/25 sm:h-32 sm:w-32" />
          <span className="relative font-display text-xs uppercase tracking-[0.3em] text-crimson">01 — Rigidity</span>
          <h3 className="relative font-display text-5xl uppercase leading-[0.9] text-cool-white sm:text-7xl">
            Strength
          </h3>
          <div className="relative flex flex-wrap gap-2">
            {STRENGTH_TRAITS.map((trait) => (
              <span
                key={trait}
                className="border border-cool-grey/20 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] text-cool-grey transition-colors duration-300 group-hover:border-crimson/40"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Merge marker — the two forces meeting */}
        <div
          aria-hidden
          className="relative flex flex-row items-center justify-center gap-3 bg-midnight-soft px-8 py-6 sm:flex-col sm:gap-3 sm:bg-transparent sm:px-3 sm:py-12"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cool-grey/25 to-transparent sm:h-full sm:w-px sm:flex-1 sm:bg-gradient-to-b" />
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-crimson/40">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson" />
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cool-grey/25 to-transparent sm:h-full sm:w-px sm:flex-1 sm:bg-gradient-to-b" />
        </div>

        {/* Flexibility — soft, round-cornered, fluid */}
        <div className="group relative flex flex-col gap-8 overflow-hidden bg-midnight p-8 sm:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(222,31,38,0.16),transparent_55%)] transition-opacity duration-500 group-hover:opacity-150"
          />
          <div
            aria-hidden
            className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-crimson/25 sm:h-48 sm:w-48"
          />
          <span className="relative font-display text-xs uppercase tracking-[0.3em] text-crimson">02 — Range</span>
          <h3 className="relative font-display text-5xl uppercase leading-[0.9] text-cool-white sm:text-7xl">
            Flexibility
          </h3>
          <div className="relative flex flex-wrap gap-2">
            {FLEXIBILITY_TRAITS.map((trait) => (
              <span
                key={trait}
                className="rounded-pill border border-cool-grey/20 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] text-cool-grey transition-colors duration-300 group-hover:border-crimson/40"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-16 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-cool-grey/20 sm:w-16" />
          <p className="font-display text-2xl uppercase tracking-tight text-cool-white sm:text-4xl">
            Muscle <span className="text-crimson">×</span> Performance
          </p>
          <span aria-hidden className="h-px w-10 bg-cool-grey/20 sm:w-16" />
        </div>
        <p className="max-w-2xl text-cool-grey">{BRAND.story[2]}</p>
      </Reveal>
    </section>
  );
}
