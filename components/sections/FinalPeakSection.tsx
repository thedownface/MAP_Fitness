import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/constants";

/**
 * The narrative bookend: the hero opened on "Your Peak" — withheld,
 * unreached. This closes the loop by returning to the mountain and
 * finishing the sentence. A static SVG silhouette (not the hero's Three.js
 * scene) — this is one section among many below the fold, not a full-page
 * flythrough, so a second WebGL scene here would cost far more than the
 * moment is worth.
 *
 * No CTA button here on purpose — CTASection follows immediately after with
 * the actual join ask. Stacking two "join" buttons back to back would be
 * exactly the CTA-fatigue the brand brief calls out; this section's job is
 * only to land the emotional payoff line before that ask arrives.
 */
export function FinalPeakSection() {
  return (
    <section className="relative overflow-hidden bg-midnight py-32 sm:py-44">
      <svg
        aria-hidden
        viewBox="0 0 1440 500"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] w-full opacity-90"
      >
        <path
          d="M0,500 L0,320 L220,180 L340,260 L520,90 L680,220 L860,60 L1040,240 L1200,140 L1440,300 L1440,500 Z"
          fill="#120607"
        />
        <path
          d="M0,500 L0,380 L260,280 L460,340 L680,220 L900,320 L1120,240 L1440,360 L1440,500 Z"
          fill="#1c0a0c"
          opacity="0.85"
        />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(222,31,38,0.16),transparent_70%)]"
      />

      <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <span className="font-display text-xs uppercase tracking-[0.5em] text-crimson">
          {BRAND.fullName}
        </span>
        <h2 className="font-display text-5xl uppercase leading-[0.9] text-cool-white sm:text-8xl">
          Reach Your Peak.
          <br />
          <span className="text-crimson">With MAP.</span>
        </h2>
      </Reveal>
    </section>
  );
}
