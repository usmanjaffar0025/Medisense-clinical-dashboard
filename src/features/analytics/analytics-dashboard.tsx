"use client";

import { dt } from "@/lib/clock";
import Link from "next/link";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { TrendChart } from "@/components/charts/trend-chart";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterBar, FilterField, Segmented, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { StatusTag } from "@/components/ui/tag";
import {
  goalStatusTotals,
  outcomesByService,
  referralSources,
  weeklyMeasures,
} from "@/data/analytics";
import { clinicians, disciplines, inScope, sites, type ClinicianScope } from "@/data/clinicians";
import { baseSchedule } from "@/data/schedule";
import { weeks } from "@/data/weeks";
import { cn } from "@/lib/cn";

const COLUMNS = "minmax(170px,1.4fr) minmax(130px,1fr) 104px 96px 120px 96px 104px 96px 104px";

const goalColour = {
  Achieved: colour.series1,
  "On track": colour.series3,
  Progressing: colour.series2,
  "At risk": colour.over,
} as const;

type SortKey = "utilisation" | "sessions" | "notes";

const totalActive = clinicians.reduce((s, c) => s + c.active, 0);

function pct(a: number, b: number) {
  return b ? Math.round((a / b) * 100) : 0;
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"4" | "12">("12");
  const [site, setSite] = useState<ClinicianScope["site"]>("all");
  const [discipline, setDiscipline] = useState<ClinicianScope["discipline"]>("all");
  const [sort, setSort] = useState<SortKey>("utilisation");

  const team = clinicians.filter((c) => inScope(c, { site, discipline }));
  const share = team.reduce((s, c) => s + c.active, 0) / totalActive;
  const from = period === "4" ? weeks.length - 4 : 0;
  const scale = (values: number[]) => values.slice(from).map((v) => Math.round(v * share));
  const range = <T,>(values: T[]) => values.slice(from);
  const labels = range([...weeks]);

  const sessions = scale(weeklyMeasures.sessions);
  const cancelled = scale(weeklyMeasures.cancelled);
  const ndis = scale(weeklyMeasures.ndisHours);
  const aged = scale(weeklyMeasures.agedCareHours);
  const notesOnTime = range(weeklyMeasures.notesOnTime);
  const firstVisit = range(weeklyMeasures.daysToFirstVisit);
  const goals =
    discipline === "Speech Pathology"
      ? range(weeklyMeasures.goalsSpeech)
      : discipline === "Occupational Therapy"
        ? range(weeklyMeasures.goalsOt)
        : range(weeklyMeasures.goalsOt).map((v, i) =>
            Math.round(v * 0.62 + (range(weeklyMeasures.goalsSpeech)[i] ?? v) * 0.38),
          );
  const utilisation = pct(
    team.reduce((s, c) => s + c.active, 0),
    team.reduce((s, c) => s + c.capacity, 0),
  );

  const last = (v: number[]) => v.at(-1) ?? 0;
  const first = (v: number[]) => v[0] ?? 0;
  const cancelRate = pct(last(cancelled), last(sessions) + last(cancelled));

  const metrics = [
    {
      label: "Sessions per week",
      value: last(sessions),
      caption: `${last(sessions) - first(sessions) >= 0 ? "+" : ""}${last(sessions) - first(sessions)} over ${period} weeks`,
    },
    {
      label: "Utilisation",
      value: `${utilisation}%`,
      caption: `${team.length} clinicians in view`,
      over: utilisation > 95,
    },
    { label: "Cancellation rate", value: `${cancelRate}%`, caption: "Of booked sessions" },
    {
      label: "Notes on time",
      value: `${last(notesOnTime)}%`,
      caption: `Approved within 2 days · was ${first(notesOnTime)}%`,
      over: last(notesOnTime) < first(notesOnTime),
    },
    {
      label: "Referral to first visit",
      value: `${last(firstVisit)} d`,
      caption: `Was ${first(firstVisit)} days`,
      over: last(firstVisit) > first(firstVisit),
    },
  ];

  const sessionsPerClinician = (id: string) =>
    baseSchedule.filter(
      (i) => i.clinicianId === id && (i.type === "Home visit" || i.type === "Telehealth"),
    );

  const rows = team
    .map((c) => {
      const week = sessionsPerClinician(c.id);
      const done = week.filter((i) => i.status !== "cancelled").length;
      return { c, sessions: done, cancelled: week.length - done };
    })
    .sort((a, b) =>
      sort === "sessions"
        ? b.sessions - a.sessions
        : sort === "notes"
          ? b.c.notesOverdue - a.c.notesOverdue
          : b.c.utilisation - a.c.utilisation,
    );

  return (
    <>
      <FilterBar aside={`Week ending ${dt("Fri 23 Oct")}`}>
        <FilterField label="Period">
          <Segmented
            label="Period"
            value={period}
            onChange={setPeriod}
            options={[
              { id: "4", label: "4 weeks" },
              { id: "12", label: "12 weeks" },
            ]}
          />
        </FilterField>
        <SelectField
          label="Region"
          value={site}
          onChange={(v) => setSite(v as ClinicianScope["site"])}
        >
          <option value="all">All regions</option>
          {sites.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <SelectField
          label="Discipline"
          value={discipline}
          onChange={(v) => setDiscipline(v as ClinicianScope["discipline"])}
        >
          <option value="all">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </SelectField>
      </FilterBar>

      <section
        aria-label="Key measures"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className={cn("headline text-stat font-normal", m.over && "text-over")}>
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card
          aria-labelledby="sessions-trend"
          className="flex flex-col px-6 pt-5 pb-4 lg:col-span-8"
        >
          <CardTitle
            id="sessions-trend"
            title="Sessions delivered"
            description="Per week, with cancellations"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Sessions delivered and cancelled per week"
              height="fill"
              data={labels.map((w, i) => ({
                week: w,
                sessions: sessions[i] ?? 0,
                cancelled: cancelled[i] ?? 0,
              }))}
              xKey="week"
              series={[
                { key: "sessions", label: "Delivered", colour: colour.series1, kind: "area" },
                { key: "cancelled", label: "Cancelled", colour: colour.over },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="goal-status" className="flex flex-col px-6 pt-5 pb-5 lg:col-span-4">
          <CardTitle
            id="goal-status"
            title="Client goals"
            description="All 428 active goals, by status"
          />
          <div className="mt-5">
            <DonutChart
              label="Goals by status"
              size={156}
              centre={`${last(goals)}%`}
              centreCaption="on track or better"
              slices={goalStatusTotals.map((g) => ({
                id: g.id,
                label: g.id,
                value: g.value,
                colour: goalColour[g.id],
              }))}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card
          aria-labelledby="hours-funding"
          className="flex flex-col px-6 pt-5 pb-4 lg:col-span-6"
        >
          <CardTitle id="hours-funding" title="Billable hours" description="Per week, by funding" />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Billable hours per week by funding"
              height="fill"
              data={labels.map((w, i) => ({ week: w, ndis: ndis[i] ?? 0, aged: aged[i] ?? 0 }))}
              xKey="week"
              format={(v) => `${v} h`}
              series={[
                { key: "ndis", label: "NDIS", colour: colour.series1 },
                { key: "aged", label: "Aged care", colour: colour.series2 },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="outcomes" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-6">
          <CardTitle
            id="outcomes"
            title="Outcomes by service"
            description="Share of goals on track or achieved"
          />
          <div className="mt-3">
            <BarList
              label="Goals on track by service"
              data={outcomesByService.map((o) => ({
                id: o.service,
                label: o.service,
                value: o.value,
                colour: o.value < 60 ? colour.monitor : colour.series1,
                detail: `${o.clients} clients`,
              }))}
              labelWidth={180}
              domain={[0, 100]}
              format={(v) => `${v}%`}
              references={[{ x: 65, label: "Team average 65%" }]}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="quality" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-6">
          <CardTitle
            id="quality"
            title="Documentation and goals"
            description="Notes approved within 2 days, and goals on track"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Notes on time and goals on track"
              height="fill"
              domain={[40, 90]}
              format={(v) => `${v}%`}
              data={labels.map((w, i) => ({
                week: w,
                notes: notesOnTime[i] ?? 0,
                goals: goals[i] ?? 0,
              }))}
              xKey="week"
              series={[
                { key: "notes", label: "Notes on time", colour: colour.series2 },
                { key: "goals", label: "Goals on track", colour: colour.series1 },
              ]}
            />
          </div>
          <Caption className="mt-2">
            Notes on time are falling as caseloads grow: the gap AI note drafting is meant to close.
          </Caption>
        </Card>

        <Card aria-labelledby="first-visit" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-3">
          <CardTitle id="first-visit" title="Referral to first visit" description="Average days" />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Days from referral to first visit"
              height="fill"
              data={labels.map((w, i) => ({ week: w, days: firstVisit[i] ?? 0 }))}
              xKey="week"
              domain={[0, 24]}
              format={(v) => `${v} d`}
              references={[{ y: 14, label: "Target 14 days" }]}
              series={[{ key: "days", label: "Days", colour: colour.series3, kind: "area" }]}
            />
          </div>
        </Card>

        <Card aria-labelledby="sources" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-3">
          <CardTitle id="sources" title="Referral sources" description="Last 90 days" />
          <div className="mt-3">
            <BarList
              label="Referrals by source"
              data={referralSources.map((r) => ({
                id: r.source,
                label: r.source,
                value: r.value,
                colour: colour.series3,
              }))}
              labelWidth={130}
              unit="referrals"
            />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="comparison" className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 pb-3">
          <CardTitle
            id="comparison"
            title="Clinician comparison"
            description="For planning support, not performance ranking"
          />
          <FilterField label="Sort by">
            <Segmented
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                { id: "utilisation", label: "Utilisation" },
                { id: "sessions", label: "Sessions" },
                { id: "notes", label: "Notes overdue" },
              ]}
            />
          </FilterField>
        </div>
        <div className="overflow-x-auto" role="table" aria-label="Clinician comparison">
          <div className="min-w-260">
            <TableHeader columns={COLUMNS}>
              <div>Clinician</div>
              <div>Discipline</div>
              <div>Region</div>
              <div>Clients</div>
              <div>Utilisation</div>
              <div>Sessions</div>
              <div>Cancelled</div>
              <div>Notes due</div>
              <div>Status</div>
            </TableHeader>
            {rows.map(({ c, sessions: s, cancelled: x }) => (
              <TableRow key={c.id} columns={COLUMNS}>
                <div className="py-2 font-semibold">
                  {c.id === "sarah-thompson" ? (
                    <Link
                      href="/caseloads/sarah-thompson"
                      className="text-ink-900 hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    c.name
                  )}
                  <span className="block text-caption font-medium text-ink-500">
                    {c.fte.toFixed(1)} FTE
                  </span>
                </div>
                <div className="text-ink-700">{c.discipline}</div>
                <div className="text-ink-700">{c.site.replace("Brisbane ", "")}</div>
                <div>
                  {c.active}
                  <span className="text-ink-500"> / {c.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-1.5 w-14 rounded-full bg-surface-sunken">
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        c.utilisation > 100 ? "bg-over-dot" : "bg-accent",
                      )}
                      style={{ width: `${Math.min(c.utilisation, 100)}%` }}
                    />
                  </div>
                  <span className={cn(c.utilisation > 100 && "font-semibold text-over")}>
                    {c.utilisation}%
                  </span>
                </div>
                <div>{s}</div>
                <div className={cn(x > 1 && "text-over")}>{x}</div>
                <div className={cn(c.notesOverdue > 2 && "font-semibold text-over")}>
                  {c.notesDue}
                </div>
                <div>
                  <StatusTag status={c.status} />
                </div>
              </TableRow>
            ))}
          </div>
        </div>
        <Caption className="px-4 py-3">
          Sessions and cancellations are this week&apos;s schedule. Every figure links back to
          records a person can check.
        </Caption>
      </Card>
    </>
  );
}
