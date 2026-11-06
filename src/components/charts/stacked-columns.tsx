"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartLegend,
  axisProps,
  axisTick,
  colour as palette,
  cursorBand,
  seriesTooltip,
} from "./chart-kit";

export type ColumnSeries = { key: string; label: string; colour: string };

type Row = Record<string, string | number>;

/** Stacked columns with a surface gap between segments and a legend for every series. */
export function StackedColumns({
  data,
  xKey,
  series,
  height = 220,
  label,
  format = (v) => String(v),
  reference,
  layout = "horizontal",
  labelWidth = 120,
}: {
  data: Row[];
  xKey: string;
  series: ColumnSeries[];
  /** A pixel height, or "fill" to take the remaining height of a flex column card. */
  height?: number | "fill";
  label: string;
  format?: (value: number) => string;
  reference?: { y: number; label: string };
  layout?: "horizontal" | "vertical";
  labelWidth?: number;
}) {
  const vertical = layout === "vertical";
  const last = series[series.length - 1]?.key;

  return (
    <figure
      aria-label={label}
      className={height === "fill" ? "m-0 flex min-h-0 flex-1 flex-col" : "m-0"}
    >
      <ChartLegend
        className="mb-2"
        items={series.map((s) => ({ label: s.label, colour: s.colour, shape: "box" as const }))}
      />
      <div
        className={height === "fill" ? "min-h-55 flex-1" : undefined}
        style={height === "fill" ? undefined : { height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={vertical ? "vertical" : "horizontal"}
            margin={{ top: 8, right: vertical ? 24 : 8, bottom: 0, left: vertical ? 0 : -12 }}
            barCategoryGap={vertical ? 8 : "28%"}
          >
            <CartesianGrid vertical={vertical} horizontal={!vertical} stroke={palette.grid} />
            {vertical ? (
              <>
                <XAxis type="number" {...axisProps} tickFormatter={(v: number) => format(v)} />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  {...axisProps}
                  width={labelWidth}
                  tick={{ ...axisTick, className: "fill-ink-700 text-caption" }}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  {...axisProps}
                  interval="preserveStartEnd"
                  minTickGap={12}
                  dy={6}
                />
                <YAxis {...axisProps} width={44} tickFormatter={(v: number) => format(v)} />
              </>
            )}
            <Tooltip
              cursor={cursorBand}
              content={seriesTooltip((v) => format(v))}
              wrapperStyle={{ zIndex: 20 }}
            />
            {reference && (
              <ReferenceLine
                y={reference.y}
                stroke={palette.ink}
                strokeDasharray="4 4"
                label={{ value: reference.label, position: "insideTopRight", ...axisTick }}
              />
            )}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="stack"
                fill={s.colour}
                stroke={palette.surface}
                strokeWidth={1}
                maxBarSize={24}
                isAnimationActive={false}
                radius={s.key === last ? (vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
