import { cn } from "@/lib/utils";

type MarqueeProps = {
  text: string;
  className?: string;
  reverse?: boolean;
};

/** Infinite horizontal ticker for the brand's campaign line. */
export function Marquee({ text, className, reverse = false }: MarqueeProps) {
  const items = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className={cn("group relative flex w-full overflow-hidden bg-crimson py-5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center gap-8 whitespace-nowrap",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "group-hover:[animation-play-state:paused]",
        )}
      >
        {items.map((i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-xl uppercase tracking-wide text-midnight sm:text-2xl">
              {text}
            </span>
            <span className="text-xl text-midnight/50">/</span>
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0 items-center gap-8 whitespace-nowrap",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "group-hover:[animation-play-state:paused]",
        )}
      >
        {items.map((i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-xl uppercase tracking-wide text-midnight sm:text-2xl">
              {text}
            </span>
            <span className="text-xl text-midnight/50">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
