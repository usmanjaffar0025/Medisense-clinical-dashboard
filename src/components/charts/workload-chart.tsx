import type { WeeklyTrend } from "@/data/types";
import { cn } from "@/lib/cn";

type Layout = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  axisLabelY: number;
  dot: number;
  lastDot: number;
  valueSize: string;
};

const layouts: Record<"full" | "compact", Layout> = {
  full: {
    width: 640,
    height: 214,
    left: 48,
    right: 560,
    top: 20,
    bottom: 180,
    axisLabelY: 202,
    dot: 3.5,
    lastDot: 4.5,
    valueSize: "text-figure",
  },
  compact: {
    width: 440,
    height: 150,
    left: 32,
    right: 360,
    top: 16,
    bottom: 120,
    axisLabelY: 140,
    dot: 3,
    lastDot: 4,
    valueSize: "text-section",
  },
};

const Y_MIN = 30;
const Y_MAX = 45;
const GRID = [45, 40, 35, 30];

export function weekX(layout: Layout, index: number, count: number) {
  return layout.left + ((layout.right - layout.left) * index) / (count - 1);
}

function percentChange(from: number, to: number) {
  return Math.round(((to - from) / from) * 100);
}

/** Weighted caseload against configured capacity, as on the caseload and supervision screens. */
export function WorkloadChart({
  trend,
  capacity,
  variant = "full",
}: {
  trend: WeeklyTrend[];
  capacity: number;
  variant?: "full" | "compact";
}) {
  const l = layouts[variant];
  const y = (value: number) => l.bottom - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * (l.bottom - l.top);
  const points = trend.map((t, i) => ({ x: weekX(l, i, trend.length), y: y(t.weightedUnits), t }));
  const first = trend[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;
  const change = percentChange(first.weightedUnits, last.t.weightedUnits);

  return (
    <svg
      viewBox={`0 0 ${l.width} ${l.height}`}
      role="img"
      aria-label={`Weighted caseload rose from ${first.weightedUnits.toFixed(1)} to ${last.t.weightedUnits.toFixed(1)} units over six weeks, against a ${capacity} unit capacity line`}
      className="block h-auto w-full font-sans"
    >
      <g className="stroke-border">
        {GRID.map((g) => (
          <line key={g} x1={l.left} x2={l.right} y1={y(g)} y2={y(g)} />
        ))}
      </g>
      <g className="fill-ink-500 text-eyebrow" textAnchor="end">
        {GRID.map((g) => (
          <text key={g} x={l.left - (variant === "full" ? 10 : 8)} y={y(g) + 4}>
            {g}
          </text>
        ))}
      </g>
      <line
        x1={l.left}
        x2={l.right}
        y1={y(capacity)}
        y2={y(capacity)}
        className="stroke-ink-500"
        strokeDasharray="4 4"
      />
      <text x={l.right + 8} y={y(capacity) + 4} className="fill-ink-500 text-eyebrow">
        Capacity {capacity}
      </text>
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        className="stroke-accent"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.slice(0, -1).map((p) => (
        <circle
          key={p.t.week}
          cx={p.x}
          cy={p.y}
          r={l.dot}
          className={p.t.weightedUnits > capacity ? "fill-over-dot" : "fill-accent"}
        />
      ))}
      <circle
        cx={last.x}
        cy={last.y}
        r={l.lastDot}
        className="fill-surface stroke-over-dot"
        strokeWidth={2}
      />
      <text
        x={last.x + (variant === "full" ? 12 : 8)}
        y={last.y + (variant === "full" ? -2 : 4)}
        className={cn("fill-ink-900 font-serif", l.valueSize)}
      >
        {last.t.weightedUnits.toFixed(1)}
      </text>
      {variant === "full" && (
        <text x={last.x + 12} y={last.y + 14} className="fill-over text-eyebrow font-semibold">
          +{change}%
        </text>
      )}
      <g className="fill-ink-500 text-eyebrow" textAnchor="middle">
        {points.map((p) => (
          <text key={p.t.week} x={p.x} y={l.axisLabelY}>
            {p.t.week}
          </text>
        ))}
      </g>
    </svg>
  );
}

const barLayouts = {
  full: {
    width: 640,
    height: 96,
    baseline: 72,
    perHour: 6,
    bar: 28,
    labelY: 88,
    chart: layouts.full,
  },
  compact: {
    width: 440,
    height: 72,
    baseline: 52,
    perHour: 4,
    bar: 22,
    labelY: 67,
    chart: layouts.compact,
  },
};

/** Weekly admin hours against the configured target. Bars above target are drawn in clay. */
export function AdminHoursChart({
  trend,
  target,
  variant = "full",
}: {
  trend: WeeklyTrend[];
  target: number;
  variant?: "full" | "compact";
}) {
  const b = barLayouts[variant];
  const top = (hours: number) => b.baseline - hours * b.perHour;
  const lastIndex = trend.length - 1;
  const spanLeft = weekX(b.chart, 0, trend.length) - b.bar / 2;
  const spanRight = weekX(b.chart, lastIndex, trend.length) + b.bar / 2;

  return (
    <svg
      viewBox={`0 0 ${b.width} ${b.height}`}
      role="img"
      aria-label={`Admin hours per week: ${trend.map((t) => t.adminHours.toFixed(1)).join(", ")} against a ${target} hour target`}
      className="block h-auto w-full font-sans"
    >
      <line
        x1={spanLeft}
        x2={spanRight}
        y1={b.baseline}
        y2={b.baseline}
        className="stroke-border"
      />
      {trend.map((t, i) => (
        <rect
          key={t.week}
          x={weekX(b.chart, i, trend.length) - b.bar / 2}
          y={top(t.adminHours)}
          width={b.bar}
          height={t.adminHours * b.perHour}
          className={t.adminHours > target ? "fill-over-dot" : "fill-chart-sand"}
        />
      ))}
      <line
        x1={spanLeft - 10}
        x2={spanRight + 10}
        y1={top(target)}
        y2={top(target)}
        className="stroke-ink-500"
        strokeDasharray="4 4"
      />
      {variant === "full" && (
        <text x={spanRight + 16} y={top(target) + 4} className="fill-ink-500 text-eyebrow">
          {target}h target
        </text>
      )}
      <g className="text-eyebrow" textAnchor="middle">
        {trend.map((t, i) => (
          <text
            key={t.week}
            x={weekX(b.chart, i, trend.length)}
            y={b.labelY}
            className={i === lastIndex ? "fill-over font-semibold" : "fill-ink-700"}
          >
            {t.adminHours.toFixed(1)}
          </text>
        ))}
      </g>
    </svg>
  );
}
