import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

type CTASectionProps = {
  headline: string;
  subline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

/** Full-bleed crimson banner with black headline, per the dossier's "JOIN THE MAP COMMUNITY" motif. */
export function CTASection({
  headline,
  subline,
  ctaLabel = "Join the MAP Community",
  ctaHref = "/contact",
  className,
}: CTASectionProps) {
  return (
    <section className={cn("relative overflow-hidden bg-crimson py-20 sm:py-28", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(10,11,11,0.08)_0px,rgba(10,11,11,0.08)_2px,transparent_2px,transparent_44px)]"
      />
      <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-midnight sm:text-6xl">
          {headline}
        </h2>
        {subline && <p className="max-w-xl text-lg text-midnight/80">{subline}</p>}
        <Button href={ctaHref} variant="ghost" className="mt-4 border border-midnight !text-midnight hover:!bg-midnight hover:!text-crimson">
          {ctaLabel}
        </Button>
      </Reveal>
    </section>
  );
}
