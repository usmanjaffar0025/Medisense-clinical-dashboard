"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipCard, axisProps, axisTick, colour as palette, cursorBand } from "./chart-kit";

export type BarDatum = {
  id: string;
  label: string;
  value: number;
  colour: string;
  /** A faded comparison value drawn behind the bar, e.g. the state before a scenario. */
  ghost?: number;
  detail?: ReactNode;
};

const ROW = 30;
const BAR = 14;

/**
 * Horizontal bars, one row per item, with hover tooltips. When `onSelect` is given the
 * bars become filters: clicking one selects it and the others fade.
 */
export function BarList({
  data,
  label,
  format = (v) => String(v),
  references = [],
  domain,
  selected,
  onSelect,
  labelWidth = 128,
  unit,
}: {
  data: BarDatum[];
  label: string;
  format?: (value: number) => string;
  references?: { x: number; label: string; tone?: "neutral" | "over" }[];
  domain?: [number, number];
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  labelWidth?: number;
  unit?: string;
}) {
  const hasGhost = data.some((d) => d.ghost !== undefined);
  const height = data.length * ROW + 28;

  function toggle(index: number) {
    const d = data[index];
    if (!onSelect || !d) return;
    onSelect(selected === d.id ? null : d.id);
  }

  return (
    <figure aria-label={label} className="m-0">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 48, bottom: 0, left: 0 }}
            barGap={-BAR}
            barCategoryGap={ROW - BAR}
          >
            <CartesianGrid horizontal={false} stroke={palette.grid} />
            <XAxis
              type="number"
              {...axisProps}
              domain={domain ?? [0, "auto"]}
              tickFormatter={(v: number) => format(v)}
            />
            <YAxis
              type="category"
              dataKey="label"
              {...axisProps}
              width={labelWidth}
              tick={{ ...axisTick, className: "fill-ink-700 text-caption" }}
            />
            <Tooltip
              cursor={cursorBand}
              wrapperStyle={{ zIndex: 20 }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as BarDatum | undefined;
                if (!active || !row) return null;
                return (
                  <TooltipCard
                    title={row.label}
                    rows={[
                      { key: "v", label: unit ?? "", value: format(row.value), colour: row.colour },
                      ...(row.ghost !== undefined
                        ? [
                            {
                              key: "g",
                              label: "before",
                              value: format(row.ghost),
                              colour: palette.stone,
                            },
                          ]
                        : []),
                    ]}
                    footer={row.detail}
                  />
                );
              }}
            />
            {references.map((r) => (
              <ReferenceLine
                key={r.label}
                x={r.x}
                stroke={r.tone === "over" ? palette.over : palette.ink}
                strokeDasharray="4 4"
                label={{ value: r.label, position: "top", ...axisTick }}
              />
            ))}
            {hasGhost && (
              <Bar dataKey="ghost" barSize={BAR} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {data.map((d) => (
                  <Cell key={d.id} fill={palette.stone} fillOpacity={0.35} />
                ))}
              </Bar>
            )}
            <Bar
              dataKey="value"
              barSize={BAR}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
              onClick={onSelect ? (_, index) => toggle(index) : undefined}
              className={onSelect ? "cursor-pointer" : undefined}
            >
              {data.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.colour}
                  fillOpacity={selected && selected !== d.id ? 0.3 : 1}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                formatter={(v) => (typeof v === "number" ? format(v) : "")}
                className="fill-ink-700 text-caption"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
