"use client";

import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TooltipCard, colour as palette } from "./chart-kit";

export type DonutSlice = { id: string; label: string; value: number; colour: string };

/**
 * A ring with the headline figure in the centre and a legend table beside it, so every
 * value is readable without hovering.
 */
export function DonutChart({
  slices,
  centre,
  centreCaption,
  label,
  size = 168,
  format = (v) => String(v),
  selected,
  onSelect,
  stacked = false,
}: {
  slices: DonutSlice[];
  centre: ReactNode;
  centreCaption: ReactNode;
  label: string;
  size?: number;
  format?: (value: number) => string;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  /** Puts the legend under the ring, for narrow cards. */
  stacked?: boolean;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const share = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <figure
      aria-label={label}
      className={`m-0 flex items-center gap-5 ${stacked ? "flex-col" : "flex-wrap"}`}
    >
      <div className="relative flex-none" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              wrapperStyle={{ zIndex: 20 }}
              content={({ active, payload }) => {
                const s = payload?.[0]?.payload as DonutSlice | undefined;
                if (!active || !s) return null;
                return (
                  <TooltipCard
                    rows={[
                      {
                        key: s.id,
                        label: `${s.label} · ${share(s.value)}%`,
                        value: format(s.value),
                        colour: s.colour,
                      },
                    ]}
                  />
                );
              }}
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="76%"
              outerRadius="100%"
              paddingAngle={1.5}
              startAngle={90}
              endAngle={-270}
              stroke={palette.surface}
              strokeWidth={2}
              isAnimationActive={false}
              onClick={
                onSelect
                  ? (_, index) => {
                      const s = slices[index];
                      if (s) onSelect(selected === s.id ? null : s.id);
                    }
                  : undefined
              }
              className={onSelect ? "cursor-pointer" : undefined}
            >
              {slices.map((s) => (
                <Cell
                  key={s.id}
                  fill={s.colour}
                  fillOpacity={selected && selected !== s.id ? 0.3 : 1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="headline text-stat font-normal">{centre}</span>
          <span className="text-caption font-medium text-ink-500">{centreCaption}</span>
        </div>
      </div>
      <ul className={`flex min-w-40 flex-col gap-0.5 ${stacked ? "w-full" : "flex-1"}`}>
        {slices.map((s) => {
          const content = (
            <>
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 flex-none rounded-xs"
                  style={{ backgroundColor: s.colour }}
                />
                {s.label}
              </span>
              <span className="text-ink-500">{share(s.value)}%</span>
              <span className="text-right font-semibold">{format(s.value)}</span>
            </>
          );
          const row =
            "grid w-full grid-cols-[minmax(0,1fr)_40px_48px] items-center gap-2 rounded-tag px-1.5 py-1 text-small";
          return (
            <li key={s.id}>
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={selected === s.id}
                  onClick={() => onSelect(selected === s.id ? null : s.id)}
                  className={`${row} cursor-pointer text-left hover:bg-canvas ${selected && selected !== s.id ? "opacity-45" : ""}`}
                >
                  {content}
                </button>
              ) : (
                <div className={row}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
