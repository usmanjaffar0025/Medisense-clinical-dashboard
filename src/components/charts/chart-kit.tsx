"use client";

import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import { cn } from "@/lib/cn";

/** Chart colours resolve to design tokens so charts follow the same palette as the UI. */
export const colour = {
  series1: "var(--color-series-1)",
  series2: "var(--color-series-2)",
  series3: "var(--color-series-3)",
  series4: "var(--color-series-4)",
  accent: "var(--color-accent)",
  over: "var(--color-over-dot)",
  monitor: "var(--color-monitor-dot)",
  healthy: "var(--color-healthy-dot)",
  available: "var(--color-available-dot)",
  sand: "var(--color-chart-sand)",
  sage: "var(--color-chart-sage)",
  slate: "var(--color-chart-slate)",
  stone: "var(--color-chart-stone)",
  grid: "var(--color-grid)",
  ink: "var(--color-ink-500)",
  surface: "var(--color-surface)",
} as const;

export const axisTick = { className: "fill-ink-500 text-eyebrow" } as const;

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: axisTick,
} as const;

export const gridProps = { vertical: false, stroke: colour.grid } as const;

export const cursorLine = { stroke: colour.ink, strokeWidth: 1, strokeDasharray: "3 3" } as const;

export const cursorBand = { fill: "var(--color-canvas)" } as const;

export type TooltipRow = { key: string; label: ReactNode; value: ReactNode; colour?: string };

export function TooltipCard({
  title,
  rows,
  footer,
}: {
  title?: ReactNode;
  rows: TooltipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-40 rounded-control border border-border bg-surface-raised px-3 py-2.5 shadow-overlay">
      {title !== undefined && <div className="mb-1.5 eyebrow">{title}</div>}
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2 text-small">
            {row.colour && (
              <span
                aria-hidden="true"
                className="h-0.5 w-3 flex-none rounded-full"
                style={{ backgroundColor: row.colour }}
              />
            )}
            <span className="font-semibold text-ink-900">{row.value}</span>
            <span className="text-ink-500">{row.label}</span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-1.5 border-t border-border pt-1.5 text-caption">{footer}</div>}
    </div>
  );
}

type Format = (value: number, key: string) => ReactNode;

/** Recharts tooltip content that lists every series at the hovered position. */
export function seriesTooltip(format: Format = (v) => v, labelOf?: (label: string) => ReactNode) {
  function SeriesTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const rows = payload
      .filter((p) => typeof p.value === "number")
      .map((p) => ({
        key: String(p.dataKey),
        label: p.name,
        value: format(p.value as number, String(p.dataKey)),
        colour: typeof p.color === "string" ? p.color : undefined,
      }));
    return <TooltipCard title={labelOf ? labelOf(String(label)) : label} rows={rows} />;
  }
  return SeriesTooltip;
}

export type LegendItem = { label: string; colour: string; shape?: "line" | "box" | "dash" };

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-caption font-medium text-ink-700",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex-none",
              item.shape === "box" && "size-2.5 rounded-xs",
              (item.shape ?? "line") === "line" && "h-0.5 w-3.5 rounded-full",
              item.shape === "dash" && "w-3.5 border-t border-dashed",
            )}
            style={
              item.shape === "dash"
                ? { borderColor: item.colour }
                : { backgroundColor: item.colour }
            }
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
