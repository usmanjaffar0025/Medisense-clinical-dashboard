"use client";

import { CalendarCheck, CalendarX, CalendarClock } from "lucide-react";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { sarahSessions, supervisionCycles } from "@/data/supervision";
import { cn } from "@/lib/cn";

const outcome = {
  held: { icon: CalendarCheck, label: "Held", className: "text-healthy" },
  rescheduled: { icon: CalendarClock, label: "Rescheduled", className: "text-monitor" },
  cancelled: { icon: CalendarX, label: "Cancelled", className: "text-over" },
} as const;

export function ProtectedTime() {
  const held = supervisionCycles.reduce((s, c) => s + c.held, 0);
  const total = supervisionCycles.reduce((s, c) => s + c.held + c.rescheduled + c.cancelled, 0);

  return (
    <Card aria-labelledby="protected-time" className="flex h-full flex-col px-5 pt-5 pb-4">
      <CardTitle
        id="protected-time"
        title="Protected supervision time"
        description="60 minutes every 4 weeks, blocked in both calendars"
        aside={<span className="headline text-stat-sm text-monitor">1 / 3</span>}
      />
      <ol className="mt-3 flex flex-col gap-0.5">
        {sarahSessions.map((s) => {
          const o = outcome[s.outcome];
          const Icon = o.icon;
          return (
            <li key={s.date} className="flex items-center gap-3 rounded-control px-1 py-1.5">
              <Icon
                className={cn("size-4 flex-none", o.className)}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="w-24 text-small font-semibold">{s.date}</span>
              <span className={cn("w-22 text-caption font-semibold", o.className)}>{o.label}</span>
              <span className="text-caption text-ink-500">{s.note}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-border pt-3.5">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="eyebrow">Team · sessions by cycle</span>
          <Caption>
            {held} of {total} held on schedule ({Math.round((held / total) * 100)}%)
          </Caption>
        </div>
        <StackedColumns
          label="Team supervision outcomes by cycle"
          height="fill"
          data={supervisionCycles}
          xKey="label"
          series={[
            { key: "held", label: "Held", colour: colour.series1 },
            { key: "rescheduled", label: "Rescheduled", colour: colour.series2 },
            { key: "cancelled", label: "Cancelled", colour: colour.over },
          ]}
        />
      </div>
    </Card>
  );
}
