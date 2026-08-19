import { cn } from "@/lib/utils";

type MapSubmarkSVGProps = {
  className?: string;
};

/** Small static "MUSCLE AND PERFORMANCE" lockup used under the main wordmark. */
export function MapSubmarkSVG({ className }: MapSubmarkSVGProps) {
  return (
    <p
      className={cn(
        "font-display text-[0.6rem] leading-tight tracking-[0.18em] text-cool-white uppercase",
        className,
      )}
    >
      Muscle and
      <br />
      Performance
    </p>
  );
}
