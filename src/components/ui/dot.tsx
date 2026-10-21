import type { Complexity, Priority } from "@/data/types";
import { cn } from "@/lib/cn";

const levelColours: Record<Complexity | Priority, string> = {
  High: "bg-over-dot",
  Medium: "bg-monitor-dot",
  Low: "bg-ink-400",
};

export function LevelDot({
  level,
  className,
}: {
  level: Complexity | Priority;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 flex-none rounded-full", levelColours[level], className)}
    />
  );
}

export function Complexity({ level, note }: { level: Complexity; note?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <LevelDot level={level} />
        {level}
      </div>
      {note && <div className="text-caption text-ink-500">{note}</div>}
    </div>
  );
}
