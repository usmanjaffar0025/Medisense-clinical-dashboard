"use client";

import { colour } from "@/components/charts/chart-kit";
import { Sparkline } from "@/components/charts/sparkline";
import { cn } from "@/lib/cn";

export type TrendCardData = {
  id: string;
  eyebrow: string;
  title: string;
  values: number[];
  labels: readonly string[];
  format?: (v: number) => string;
  unit: string;
  /** Whether a rising value is good news, which decides the colour of the change. */
  upIsGood: boolean;
  caption: string;
};

function Change({
  values,
  upIsGood,
  format,
}: Pick<TrendCardData, "values" | "upIsGood" | "format">) {
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const diff = Math.round((last - first) * 10) / 10;
  const good = diff === 0 ? null : diff > 0 === upIsGood;
  const text = format ? format(Math.abs(diff)) : String(Math.abs(diff));
  return (
    <span
      className={cn(
        "text-caption font-semibold",
        good === null ? "text-ink-500" : good ? "text-healthy" : "text-over",
      )}
    >
      {diff > 0 ? "▲" : diff < 0 ? "▼" : "■"} {text}
    </span>
  );
}

export function TrendCards({
  cards,
  periodLabel,
}: {
  cards: TrendCardData[];
  periodLabel: string;
}) {
  return (
    <section
      aria-label="Trends"
      className="stat-band mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-border bg-border surface-lift sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const last = card.values[card.values.length - 1] ?? 0;
        const rising = last >= (card.values[0] ?? 0);
        const bad = rising !== card.upIsGood;
        return (
          <div key={card.id} className="flex flex-col gap-2 bg-surface px-5 pt-4 pb-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow">{card.eyebrow}</span>
              <span className="text-caption font-medium text-ink-500">{periodLabel}</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="headline text-stat font-normal">
                {card.format ? card.format(last) : last}
              </span>
              <Change values={card.values} upIsGood={card.upIsGood} format={card.format} />
            </div>
            <div className="text-small font-semibold text-ink-900">{card.title}</div>
            <Sparkline
              values={card.values}
              labels={card.labels}
              colour={bad ? colour.over : colour.accent}
              height={44}
              format={card.format}
              unit={card.unit}
            />
            <span className="text-caption font-medium text-ink-500">{card.caption}</span>
          </div>
        );
      })}
    </section>
  );
}
