import { PROGRAM_ANIMATIONS, type ProgramAnimationKey } from "@/components/animations/registry";
import { cn } from "@/lib/utils";
import { AnimatedTile } from "./AnimatedTile";
import { PhotoTile } from "./PhotoTile";
import { Reveal } from "./Reveal";

type FeatureItem = {
  index: string;
  title: string;
  description: string;
  image?: string;
  animation?: ProgramAnimationKey;
  href?: string;
};

type FeatureGridProps = {
  items: readonly FeatureItem[];
  columns?: 2 | 3;
  className?: string;
};

export function FeatureGrid({ items, columns = 2, className }: FeatureGridProps) {
  return (
    <Reveal
      stagger
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        if (item.animation) {
          const Scene = PROGRAM_ANIMATIONS[item.animation];
          return (
            <AnimatedTile
              key={item.index}
              title={item.title}
              description={item.description}
              index={item.index}
              href={item.href}
            >
              <Scene />
            </AnimatedTile>
          );
        }
        return item.image ? (
          <PhotoTile
            key={item.index}
            src={item.image}
            alt={item.title}
            title={item.title}
            description={item.description}
            index={item.index}
            href={item.href}
          />
        ) : (
          <div
            key={item.index}
            className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-sharp border border-cool-grey/15 bg-midnight-soft p-6 transition-colors duration-300 hover:border-crimson/60"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(222,31,38,0.18),transparent_60%)] transition-opacity duration-500 group-hover:opacity-150"
            />
            <span className="relative flex h-8 w-8 items-center justify-center bg-crimson font-display text-sm text-midnight">
              {item.index}
            </span>
            <div className="relative flex flex-col gap-2">
              <h3 className="font-display text-xl uppercase tracking-wide text-cool-white sm:text-2xl">
                {item.title}
              </h3>
              <p className="text-sm text-cool-grey">{item.description}</p>
            </div>
          </div>
        );
      })}
    </Reveal>
  );
}
