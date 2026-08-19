import { Reveal } from "@/components/ui/Reveal";

/**
 * A short signpost between the hero's emotional close ("The Climb") and the
 * informational sections that follow — tells the visitor explicitly what
 * happens next, rather than letting "Your Limit Is You" arrive with no
 * transition. Deliberately brief: this is a bridge, not a destination.
 */
export function ScrollDiscoverSection() {
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center gap-4 bg-midnight px-6 text-center">
      <Reveal className="flex flex-col items-center gap-4" start="top 100%">
        <span aria-hidden className="h-10 w-px animate-pulse bg-crimson/60" />
        <p className="font-display text-xl uppercase tracking-tight text-cool-white sm:text-2xl">
          Scroll to Discover <span className="text-crimson">MAP</span>
        </p>
        <p className="text-sm uppercase tracking-[0.3em] text-cool-grey">
          And Reach Your Peak
        </p>
      </Reveal>
    </section>
  );
}
