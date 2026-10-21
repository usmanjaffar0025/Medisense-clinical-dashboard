import { Caption, Card } from "@/components/ui/card";
import type { ScoreFactor } from "@/data/types";

export function ScoreBreakdown({
  factors,
  thresholds,
}: {
  factors: ScoreFactor[];
  thresholds: { monitor: number; over: number };
}) {
  const total = factors.reduce((sum, f) => sum + f.points, 0);
  const max = factors.reduce((sum, f) => sum + f.max, 0);

  return (
    <Card aria-labelledby="why-score" className="flex flex-col px-6 pt-5 pb-4.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="why-score" className="headline text-h2">
            Why this score
          </h2>
          <Caption className="mt-1">Six configured indicators, weighted to {max}.</Caption>
        </div>
        <div className="text-right">
          <span className="headline text-kpi font-normal">{total}</span>
          <span className="font-serif text-figure text-ink-500"> / {max}</span>
        </div>
      </div>

      <div className="mt-3 border-t border-border-strong">
        {factors.map((f) => (
          <div
            key={f.label}
            className="grid grid-cols-[minmax(0,1fr)_96px_56px] items-center gap-3.5 border-b border-border py-2.75"
          >
            <div>
              <div className="text-small font-semibold">{f.label}</div>
              <Caption>{f.detail}</Caption>
            </div>
            <div className="relative h-1 rounded-full bg-surface-sunken">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-accent"
                style={{ width: `${(f.points / f.max) * 100}%` }}
              />
            </div>
            <div className="text-right text-small">
              {f.points} / {f.max}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4.5">
        <div className="flex h-2 overflow-hidden rounded-full" aria-hidden="true">
          <span className="bg-healthy-bg" style={{ flex: thresholds.monitor }} />
          <span className="bg-monitor-bg" style={{ flex: thresholds.over - thresholds.monitor }} />
          <span className="bg-over-bg" style={{ flex: max - thresholds.over }} />
        </div>
        <div className="relative h-0" aria-hidden="true">
          <span
            className="absolute -top-3 h-4 w-0.5 rounded-full bg-ink-900"
            style={{ left: `${(total / max) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-caption font-medium text-ink-500">
          <span>Healthy &lt;{thresholds.monitor}</span>
          <span>
            Monitor {thresholds.monitor}–{thresholds.over - 1}
          </span>
          <span className="text-over">Over Capacity ≥{thresholds.over}</span>
        </div>
      </div>

      <Caption className="mt-4 border-t border-border pt-3">
        Score reflects configured operational indicators only. It is not a clinical assessment.
      </Caption>
    </Card>
  );
}
