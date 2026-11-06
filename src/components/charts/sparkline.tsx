"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { TooltipCard, colour as palette } from "./chart-kit";

/** A compact 12-week trend for stat tiles and table rows. The latest point is marked. */
export function Sparkline({
  values,
  labels,
  colour = palette.accent,
  height = 36,
  format = (v) => String(v),
  unit,
}: {
  values: number[];
  labels: readonly string[];
  colour?: string;
  height?: number;
  format?: (value: number) => string;
  unit?: string;
}) {
  const data = values.map((value, i) => ({ week: labels[i] ?? "", value }));
  const last = data.length - 1;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, 0.5);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 3, left: 2 }}>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Tooltip
            cursor={{ stroke: palette.ink, strokeWidth: 1, strokeDasharray: "2 2" }}
            wrapperStyle={{ zIndex: 20 }}
            content={({ active, payload }) => {
              const point = payload?.[0];
              if (!active || !point || typeof point.value !== "number") return null;
              const row = point.payload as { week: string };
              return (
                <TooltipCard
                  title={`Week of ${row.week}`}
                  rows={[{ key: "v", label: unit ?? "", value: format(point.value), colour }]}
                />
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            fill={colour}
            fillOpacity={0.1}
            isAnimationActive={false}
            dot={(props: { cx?: number; cy?: number; index?: number }) =>
              props.index === last && props.cx !== undefined && props.cy !== undefined ? (
                <circle
                  key="last"
                  cx={props.cx}
                  cy={props.cy}
                  r={3.5}
                  fill={colour}
                  stroke={palette.surface}
                  strokeWidth={2}
                />
              ) : (
                <g key={props.index} />
              )
            }
            activeDot={{ r: 4, fill: colour, stroke: palette.surface, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
