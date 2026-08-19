import { cn } from "@/lib/utils";

type SectionTagProps = {
  index?: string;
  label?: string;
  className?: string;
};

/** Numbered red corner badge motif from the brand dossier (01 / 02 / 03…). */
export function SectionTag({ index, label, className }: SectionTagProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {index && (
        <span className="flex h-8 min-w-8 items-center justify-center bg-crimson px-2 font-display text-sm text-midnight">
          {index}
        </span>
      )}
      {label && (
        <span className="font-display text-xs uppercase tracking-[0.3em] text-cool-grey">{label}</span>
      )}
    </div>
  );
}
