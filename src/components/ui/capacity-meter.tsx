import { cn } from "@/lib/cn";

/** The meter's full width represents 120% so overflow past capacity stays visible. */
const SCALE = 120;
const CAPACITY_MARK = `${(100 / SCALE) * 100}%`;

export function CapacityMeter({
  utilisation,
  available = false,
  className,
}: {
  utilisation: number;
  available?: boolean;
  className?: string;
}) {
  const within = (Math.min(utilisation, 100) / SCALE) * 100;
  const over = utilisation > 100 ? ((utilisation - 100) / SCALE) * 100 : 0;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={SCALE}
      aria-valuenow={utilisation}
      aria-label={`${utilisation}% of configured capacity`}
      className={cn("relative h-1.5 rounded-full bg-surface-sunken", className)}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full",
          available ? "bg-available-dot" : "bg-accent",
        )}
        style={{ width: `${within}%` }}
      />
      {over > 0 && (
        <div
          className="absolute inset-y-0 rounded-r-full bg-over-dot"
          style={{ left: CAPACITY_MARK, width: `${over}%` }}
        />
      )}
      <div
        className="absolute -inset-y-0.75 w-0 border-l border-dashed border-ink-500"
        style={{ left: CAPACITY_MARK }}
      />
    </div>
  );
}

export { CAPACITY_MARK, SCALE as CAPACITY_SCALE };
