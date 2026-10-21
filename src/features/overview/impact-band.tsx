import { Caption, Card } from "@/components/ui/card";
import type { ImpactMeasure } from "@/data/organisation";

export function ImpactBand({ measures }: { measures: ImpactMeasure[] }) {
  return (
    <Card id="impact" aria-labelledby="impact-title" className="mt-8 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-5 pb-4.5">
        <div>
          <p className="eyebrow">Impact</p>
          <h2 id="impact-title" className="mt-1.5 headline text-h2">
            Since Medisense pilot began, 8 weeks
          </h2>
        </div>
        <Caption>Illustrative pilot outcomes · demo data</Caption>
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-5">
        {measures.map((m) => (
          <div key={m.label} className="flex flex-col gap-2 bg-surface px-6 pt-5 pb-6">
            <div className="eyebrow">{m.label}</div>
            <div className="headline text-stat font-normal">
              <span className="text-ink-400">{m.before}</span>{" "}
              <span className="text-stat-sm text-ink-400" aria-label="to">
                →
              </span>{" "}
              {m.now}
            </div>
            <Caption>{m.change}</Caption>
          </div>
        ))}
      </div>
    </Card>
  );
}
