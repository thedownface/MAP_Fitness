import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/constants";
import { Button } from "./Button";

type PricingCardProps = {
  name: string;
  price: number;
  note?: string;
  features?: readonly string[] | string[];
  highlight?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function PricingCard({
  name,
  price,
  note,
  features,
  highlight = false,
  ctaLabel = "Join Now",
  ctaHref = "/contact",
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-sharp border p-8 transition-all duration-300 ease-map",
        highlight
          ? "border-crimson bg-midnight-soft shadow-[0_0_40px_-12px_rgba(222,31,38,0.5)]"
          : "border-cool-grey/15 bg-midnight-soft/40 hover:border-crimson/60",
        className,
      )}
    >
      {highlight && (
        <span className="absolute right-0 top-0 bg-crimson px-4 py-1 font-display text-xs uppercase tracking-widest text-midnight">
          Popular
        </span>
      )}
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-cool-white">{name}</h3>
        {note && <p className="mt-1 text-sm text-cool-grey">{note}</p>}
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-4xl text-crimson sm:text-5xl">{formatINR(price)}</span>
          <span className="text-sm text-cool-grey">+GST</span>
        </div>
        {features && features.length > 0 && (
          <ul className="mt-8 flex flex-col gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-cool-grey">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-crimson" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button href={ctaHref} variant={highlight ? "sharp" : "pill"} className="mt-10 w-full">
        {ctaLabel}
      </Button>
    </div>
  );
}
