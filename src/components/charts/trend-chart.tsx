"use client";

import type { ReactNode } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
  cursorLine,
  gridProps,
  seriesTooltip,
} from "./chart-kit";

export type TrendSeries = {
  key: string;
  label: string;
  colour: string;
  kind?: "line" | "area";
};

export type TrendReference = { y: number; label: string; tone?: "neutral" | "over" };

type Row = Record<string, string | number>;

/**
 * Line or area trend over weeks with a crosshair tooltip that reads out every series.
 * Two or more series get a legend; a single series is named by the card title instead.
 */
export function TrendChart({
  data,
  xKey,
  series,
  height = 240,
  references = [],
  domain,
  format = (v) => String(v),
  tooltipTitle,
  label,
}: {
  data: Row[];
  xKey: string;
  series: TrendSeries[];
  /** A pixel height, or "fill" to take the remaining height of a flex column card. */
  height?: number | "fill";
  references?: TrendReference[];
  domain?: [number | "auto" | "dataMin", number | "auto" | "dataMax"];
  format?: (value: number) => string;
  tooltipTitle?: (x: string) => ReactNode;
  label: string;
}) {
  const lastIndex = data.length - 1;

  return (
    <figure
      aria-label={label}
      className={height === "fill" ? "m-0 flex min-h-0 flex-1 flex-col" : "m-0"}
    >
      {series.length > 1 && (
        <ChartLegend
          className="mb-2"
          items={[
            ...series.map((s) => ({
              label: s.label,
              colour: s.colour,
              shape: s.kind === "area" ? ("box" as const) : ("line" as const),
            })),
            ...references.map((r) => ({
              label: r.label,
              colour: palette.ink,
              shape: "dash" as const,
            })),
          ]}
        />
      )}
      <div
        className={height === "fill" ? "min-h-55 flex-1" : undefined}
        style={height === "fill" ? undefined : { height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey={xKey}
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={18}
              dy={6}
            />
            <YAxis
              {...axisProps}
              domain={domain ?? ["auto", "auto"]}
              width={44}
              tickFormatter={(v: number) => format(v)}
            />
            <Tooltip
              cursor={cursorLine}
              content={seriesTooltip((v) => format(v), tooltipTitle)}
              wrapperStyle={{ zIndex: 20 }}
            />
            {references.map((r) => (
              <ReferenceLine
                key={r.label}
                y={r.y}
                stroke={r.tone === "over" ? palette.over : palette.ink}
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
                label={{
                  value: r.label,
                  position: "insideTopRight",
                  ...axisTick,
                }}
              />
            ))}
            {series.map((s) =>
              s.kind === "area" ? (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.colour}
                  strokeWidth={2}
                  fill={s.colour}
                  fillOpacity={0.1}
                  isAnimationActive={false}
                  activeDot={{ r: 4.5, stroke: palette.surface, strokeWidth: 2, fill: s.colour }}
                  dot={false}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.colour}
                  strokeWidth={2}
                  isAnimationActive={false}
                  activeDot={{ r: 4.5, stroke: palette.surface, strokeWidth: 2, fill: s.colour }}
                  dot={(props: { cx?: number; cy?: number; index?: number }) =>
                    props.index === lastIndex &&
                    props.cx !== undefined &&
                    props.cy !== undefined ? (
                      <circle
                        key={`${s.key}-last`}
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill={s.colour}
                        stroke={palette.surface}
                        strokeWidth={2}
                      />
                    ) : (
                      <g key={`${s.key}-${props.index}`} />
                    )
                  }
                />
              ),
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
