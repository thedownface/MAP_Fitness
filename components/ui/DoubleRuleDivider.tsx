import { cn } from "@/lib/utils";

/** Stacked thin red + black rule seen throughout the brand dossier. */
export function DoubleRuleDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-[3px]", className)}>
      <div className="h-[2px] w-full bg-crimson" />
      <div className="h-[1px] w-full bg-cool-grey/20" />
    </div>
  );
}
