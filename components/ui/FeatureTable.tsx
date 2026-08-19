type FeatureRow = {
  label: string;
  description: string;
};

export function FeatureTable({ rows }: { rows: readonly FeatureRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-2 border-t border-cool-grey/15 py-6 sm:grid-cols-[minmax(220px,1fr)_2fr] sm:gap-8"
          style={{ borderTopColor: i === 0 ? "transparent" : undefined }}
        >
          <span className="font-display text-sm uppercase tracking-wide text-crimson sm:text-base">
            {row.label}
          </span>
          <span className="text-cool-grey">{row.description}</span>
        </div>
      ))}
    </div>
  );
}
