"use client";

import { dt } from "@/lib/clock";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { adminHoursByWeek, loggedHoursPerWeek, timeByCategory } from "@/data/admin";
import { clinicians } from "@/data/clinicians";
import { weeks } from "@/data/weeks";

/** One colour per category, shared by the donut, the category trends and the weekly chart. */
const categoryColour = {
  evergreen: colour.series1,
  sage: colour.series2,
  sand: colour.series3,
  slate: colour.sand,
  stone: colour.series4,
} as const;

export function TimeBreakdown() {
  const [selected, setSelected] = useState<string | null>(null);
  const focus = timeByCategory.find((c) => c.label === selected);
  const growth = (
    [
      { key: "travel", label: "Travel between visits", colour: categoryColour.slate },
      { key: "documentation", label: "Documentation", colour: categoryColour.sage },
      { key: "reports", label: "Reports", colour: categoryColour.sand },
      { key: "admin", label: "Scheduling & internal admin", colour: categoryColour.stone },
    ] as const
  ).map((g) => ({ ...g, values: adminHoursByWeek.map((w) => w[g.key]) }));

  return (
    <Card aria-labelledby="time-by-category" className="flex h-full flex-col px-6 pt-5 pb-5">
      <CardTitle
        id="time-by-category"
        title="Time by category"
        description={`Org-wide · ≈${loggedHoursPerWeek} logged hours per week · click a category`}
      />
      <div className="mt-5 mb-5">
        <DonutChart
          label="Logged time by category"
          size={176}
          centre={focus ? `${focus.share}%` : `${timeByCategory[0]?.share ?? 0}%`}
          centreCaption={focus ? focus.label.toLowerCase() : "clinical"}
          format={(v) => `${v}h`}
          selected={selected}
          onSelect={setSelected}
          slices={timeByCategory.map((c) => ({
            id: c.label,
            label: c.label,
            value: c.hours,
            colour: categoryColour[c.colour],
          }))}
        />
      </div>
      <div className="border-t border-border pt-3.5">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="eyebrow">Hours outside sessions, 12 weeks</span>
          <Caption>
            Week of {dt("3 Aug")} → {dt("19 Oct")}
          </Caption>
        </div>
        <ul className="flex flex-col">
          {growth.map((g) => (
            <li
              key={g.key}
              className="grid grid-cols-[minmax(0,1fr)_96px_72px] items-center gap-3 border-b border-border py-1.5 last:border-b-0"
            >
              <span className="flex items-center gap-2 text-small">
                <span
                  aria-hidden="true"
                  className="size-2.5 flex-none rounded-xs"
                  style={{ backgroundColor: g.colour }}
                />
                {g.label}
              </span>
              <Sparkline
                values={g.values}
                labels={weeks}
                colour={g.colour}
                height={28}
                format={(v) => `${v}h`}
                unit={g.label.toLowerCase()}
              />
              <span className="text-right text-small">
                <b className="font-semibold">{g.values[g.values.length - 1]}h</b>{" "}
                <span className="text-over">
                  +{(g.values[g.values.length - 1] ?? 0) - (g.values[0] ?? 0)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Caption className="mt-auto border-t border-border pt-3">
        45% of logged time is outside sessions, and 12% is driving between home visits. Individual
        admin targets (7h per 1.0 FTE) cover documentation only.
      </Caption>
    </Card>
  );
}

export function AdminTrend() {
  const [range, setRange] = useState<"6" | "12">("12");
  const rows = adminHoursByWeek.slice(-Number(range));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const total = (r: (typeof rows)[number]) => r.documentation + r.reports + r.travel + r.admin;

  return (
    <Card aria-labelledby="admin-trend" className="flex h-full flex-col px-6 pt-5 pb-4">
      <CardTitle
        id="admin-trend"
        title="Hours outside sessions per week"
        description={
          first && last
            ? `Team total ${total(first)}h → ${total(last)}h · week of ${first.week} to ${last.week}`
            : undefined
        }
        aside={
          <Segmented
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { id: "6", label: "6 wks" },
              { id: "12", label: "12 wks" },
            ]}
          />
        }
      />
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <StackedColumns
          label="Non-clinical hours by category per week"
          height="fill"
          data={rows}
          xKey="week"
          format={(v) => `${v}h`}
          series={[
            { key: "travel", label: "Travel", colour: categoryColour.slate },
            { key: "documentation", label: "Documentation", colour: categoryColour.sage },
            { key: "reports", label: "Reports", colour: categoryColour.sand },
            { key: "admin", label: "Scheduling & admin", colour: categoryColour.stone },
          ]}
        />
      </div>
    </Card>
  );
}

export function AdminByClinician() {
  const data = [...clinicians]
    .sort((a, b) => b.adminHours / b.adminTarget - a.adminHours / a.adminTarget)
    .map((c) => ({
      id: c.id,
      label: c.name,
      value: Math.round((c.adminHours / c.adminTarget) * 100),
      colour: c.adminHours > c.adminTarget ? colour.over : colour.accent,
      detail: `${c.adminHours.toFixed(1)}h of a ${c.adminTarget.toFixed(1)}h target (${c.fte.toFixed(1)} FTE)`,
    }));
  const over = data.filter((d) => d.value > 100).length;

  return (
    <Card aria-labelledby="admin-by-clinician" className="h-full px-6 pt-5 pb-4">
      <CardTitle
        id="admin-by-clinician"
        title="Documentation hours against target"
        description="Last week, as a share of each clinician’s pro-rata target"
        aside={<span className="headline text-stat-sm text-over">{over} over</span>}
      />
      <div className="mt-3">
        <BarList
          label="Documentation hours as a share of target"
          data={data}
          domain={[0, 140]}
          format={(v) => `${v}%`}
          unit="of target"
          labelWidth={124}
          references={[{ x: 100, label: "Target" }]}
        />
      </div>
    </Card>
  );
}
