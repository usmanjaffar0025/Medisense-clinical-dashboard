import type { Kpi } from "@/data/organisation";
import { Changed } from "@/components/ai/marks";
import { cn } from "@/lib/cn";

export function KpiGrid({ kpis, label }: { kpis: Kpi[]; label: string }) {
  return (
    <section
      aria-label={label}
      className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border surface-lift lg:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(
            "flex min-h-33 flex-col gap-2.5 bg-surface px-6 py-5",
            kpi.flagged && "shadow-flag",
          )}
        >
          <div className="eyebrow">{kpi.label}</div>
          <div className="headline text-kpi font-normal">
            <Changed value={kpi.value} was={kpi.was} />
          </div>
          <div className="text-caption font-medium text-ink-500">{kpi.caption}</div>
        </div>
      ))}
    </section>
  );
}
