import type { TimeCategory } from "@/data/admin";

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Small gap between segments so adjacent colours read as separate. */
const GAP = 2;

export const categoryColour: Record<TimeCategory["colour"], { stroke: string; fill: string }> = {
  evergreen: { stroke: "stroke-chart-evergreen", fill: "bg-chart-evergreen" },
  sage: { stroke: "stroke-chart-sage", fill: "bg-chart-sage" },
  sand: { stroke: "stroke-chart-sand", fill: "bg-chart-sand" },
  slate: { stroke: "stroke-chart-slate", fill: "bg-chart-slate" },
  stone: { stroke: "stroke-chart-stone", fill: "bg-chart-stone" },
};

export function TimeDonut({ categories }: { categories: TimeCategory[] }) {
  const total = categories.reduce((sum, c) => sum + c.share, 0);
  const lead = categories[0];
  const segments = categories.map((c, i) => {
    const before = categories.slice(0, i).reduce((sum, p) => sum + p.share, 0);
    return {
      category: c,
      length: (c.share / total) * CIRCUMFERENCE,
      offset: (before / total) * CIRCUMFERENCE,
    };
  });

  return (
    <div className="relative size-50">
      <svg
        viewBox="0 0 180 180"
        role="img"
        aria-label={categories.map((c) => `${c.label} ${c.share}%`).join(", ")}
        className="block size-50"
      >
        <g transform="rotate(-90 90 90)" fill="none" strokeWidth={14}>
          {segments.map(({ category, length, offset }) => (
            <circle
              key={category.label}
              cx={90}
              cy={90}
              r={RADIUS}
              className={categoryColour[category.colour].stroke}
              strokeDasharray={`${Math.max(length - GAP, 0)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
            />
          ))}
        </g>
      </svg>
      {lead && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="headline text-kpi font-normal">{lead.share}%</span>
          <span className="font-serif text-section text-ink-700">clinical</span>
        </div>
      )}
    </div>
  );
}
