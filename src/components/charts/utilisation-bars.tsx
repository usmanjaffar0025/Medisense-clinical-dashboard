import { CAPACITY_MARK, CAPACITY_SCALE } from "@/components/ui/capacity-meter";
import type { Clinician } from "@/data/types";
import { cn } from "@/lib/cn";

const ticks = [0, 30, 60, 90, 100, 120];

function position(value: number) {
  return `${(value / CAPACITY_SCALE) * 100}%`;
}

/** Horizontal utilisation bars, sorted highest first, with overflow past 100% in clay. */
export function UtilisationBars({ clinicians }: { clinicians: Clinician[] }) {
  const sorted = [...clinicians].sort((a, b) => b.utilisation - a.utilisation);

  return (
    <figure aria-label="Utilisation by clinician" className="m-0">
      <div className="grid grid-cols-[168px_minmax(0,1fr)] gap-x-4">
        <div>
          {sorted.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex h-8 items-center truncate text-small",
                c.utilisation > 100 || c.available ? "font-semibold" : "font-medium",
              )}
            >
              {c.name}
            </div>
          ))}
        </div>
        <div className="relative">
          {[30, 60, 90].map((t) => (
            <div
              key={t}
              aria-hidden="true"
              className="absolute inset-y-0 border-l border-border"
              style={{ left: position(t) }}
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 border-l border-dashed border-ink-500"
            style={{ left: CAPACITY_MARK }}
          />
          {sorted.map((c) => {
            const within = (Math.min(c.utilisation, 100) / c.utilisation) * 100;
            return (
              <div key={c.id} className="relative flex h-8 items-center gap-2">
                <div
                  className="flex h-3.5 overflow-hidden rounded-xs"
                  style={{ width: position(c.utilisation) }}
                  role="img"
                  aria-label={`${c.name}: ${c.utilisation}% of configured capacity`}
                >
                  <span
                    className={c.available ? "bg-chart-slate" : "bg-accent"}
                    style={{ width: `${within}%` }}
                  />
                  {c.utilisation > 100 && <span className="flex-1 bg-over-dot" />}
                </div>
                <span
                  className={cn(
                    "text-small",
                    c.utilisation > 100
                      ? "font-semibold text-over"
                      : c.available
                        ? "font-semibold text-available"
                        : "font-medium text-ink-700",
                  )}
                >
                  {c.utilisation}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-[168px_minmax(0,1fr)] gap-x-4">
        <div />
        <div className="relative h-4 text-caption font-medium text-ink-500" aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className={cn(
                "absolute",
                t === 0 ? "" : t === 120 ? "-translate-x-full" : "-translate-x-1/2",
                t === 100 && "font-semibold text-ink-900",
              )}
              style={{ left: position(t) }}
            >
              {t}%
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
