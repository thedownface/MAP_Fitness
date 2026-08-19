import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type RecoveryItem = {
  index: string;
  title: string;
  description: string;
  image: string;
};

const CARD_POSITIONS = [
  "sm:col-span-2 sm:row-start-1", // Sauna — large
  "sm:col-start-3 sm:row-start-1", // Steam Room — narrow
  "sm:col-start-1 sm:row-start-2", // Ice Plunge — narrow
  "sm:col-span-2 sm:col-start-2 sm:row-start-2", // Red Light Therapy — large
];

/** Asymmetric bento grid of real recovery-floor photography. */
export function RecoveryBento({ items }: { items: readonly RecoveryItem[] }) {
  return (
    <Reveal
      stagger
      className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-[minmax(280px,1fr)_minmax(280px,1fr)]"
    >
      {items.map((item, i) => (
        <div
          key={item.index}
          className={cn(
            "duotone group relative min-h-[280px] overflow-hidden rounded-sharp",
            CARD_POSITIONS[i] ?? "",
          )}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 66vw, 100vw"
            className="object-cover grayscale transition-transform duration-700 ease-map group-hover:scale-105"
          />
          <div className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center bg-crimson font-display text-sm text-midnight">
            {item.index}
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-6">
            <h3 className="font-display text-2xl uppercase tracking-wide text-cool-white sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-cool-grey">{item.description}</p>
          </div>
        </div>
      ))}
    </Reveal>
  );
}
