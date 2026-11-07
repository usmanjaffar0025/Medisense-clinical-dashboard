import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const tones = [
  "from-available-dot to-accent-fill-pressed",
  "from-series-2 to-healthy",
  "from-series-3 to-accent-fill-pressed",
  "from-series-4 to-series-3",
  "from-accent-fill to-series-2",
];

export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

/** Initials on a gradient. The same name always gets the same colour. */
export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const hash = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "flex flex-none items-center justify-center rounded-full bg-linear-to-br font-semibold text-white",
        tones[hash % tones.length],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

/** A progress ring, with its figure in the centre. */
export function Ring({
  percent,
  size = 88,
  stroke = 8,
  label,
  children,
  light = false,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label: string;
  children: ReactNode;
  light?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <span
      role="img"
      aria-label={label}
      className="relative inline-flex flex-none items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={light ? "rgb(255 255 255 / 0.22)" : "var(--color-border)"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={light ? "#ffffff" : "var(--color-accent-fill)"}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        {children}
      </span>
    </span>
  );
}

/** Steps a piece of work moves through, with the current one highlighted. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-1.5">
      {steps.map((step, i) => (
        <li key={step} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span
            aria-hidden="true"
            className={cn("h-1.5 rounded-full", i <= current ? "bg-accent-fill" : "bg-canvas")}
          />
          <span
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "truncate text-caption",
              i === current ? "font-semibold text-ink-900" : "text-ink-500",
            )}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
