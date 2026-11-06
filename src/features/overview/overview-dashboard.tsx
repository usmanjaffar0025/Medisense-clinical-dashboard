"use client";

import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { TrendChart } from "@/components/charts/trend-chart";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterBar, FilterField, Segmented } from "@/components/ui/segmented";
import { scoreThresholds, type ClinicianScope } from "@/data/clinicians";
import { summarise } from "@/data/organisation";
import type { CaseloadStatus, Discipline, Site } from "@/data/types";
import { weeks } from "@/data/weeks";
import { AttentionPanel } from "./attention-panel";
import { CaseloadHealth } from "./caseload-health";
import { KpiGrid } from "./kpi-grid";
import { TrendCards, type TrendCardData } from "./trend-cards";

const statusColour: Record<CaseloadStatus, string> = {
  "at-risk": colour.over,
  monitor: colour.monitor,
  healthy: colour.accent,
};

const percent = (v: number) => `${v}%`;

export function OverviewDashboard() {
  const [site, setSite] = useState<"all" | Site>("all");
  const [discipline, setDiscipline] = useState<"all" | Discipline>("all");
  const [period, setPeriod] = useState<"6" | "12">("12");
  const scope: ClinicianScope = { site, discipline };
  const s = summarise(scope);
  const n = Number(period);
  const labels = weeks.slice(-n);
  const periodLabel = `${n} wks`;

  const cards: TrendCardData[] = [
    {
      id: "backlog",
      eyebrow: "Admin backlog",
      title: "Notes due across the team",
      values: s.series.notesDue.slice(-n),
      labels,
      unit: "notes due",
      upIsGood: false,
      caption: "Overdue notes plus AI drafts awaiting approval",
    },
    {
      id: "pressure",
      eyebrow: "Caseload pressure",
      title: "Utilisation of configured capacity",
      values: s.series.utilisation.slice(-n),
      labels,
      format: percent,
      unit: "utilisation",
      upIsGood: false,
      caption: `${s.active} active clients · ${s.capacity} places`,
    },
    {
      id: "follow-ups",
      eyebrow: "Follow-up risk",
      title: "Client follow-ups overdue",
      values: s.series.followUps.slice(-n),
      labels,
      unit: "overdue",
      upIsGood: false,
      caption: `${s.attention.length} clients in the review queue`,
    },
    {
      id: "supervision",
      eyebrow: "Supervision completion",
      title: "Sessions held on schedule",
      values: s.series.supervision.slice(-n),
      labels,
      format: percent,
      unit: "held on schedule",
      upIsGood: true,
      caption: `${s.supervision.held} of ${s.supervision.total} sessions in the last 3 cycles`,
    },
  ];

  const caseloadTrend = labels.map((week, i) => ({
    week,
    active: s.series.active.slice(-n)[i] ?? 0,
    capacity: s.capacity,
  }));

  const pressure = [...s.list]
    .sort((a, b) => b.score - a.score)
    .map((c) => ({
      id: c.id,
      label: c.name,
      value: c.score,
      colour: statusColour[c.status],
      detail: `${c.active} / ${c.capacity} clients · ${c.highComplexity} high-complexity`,
    }));

  const backlog = [...s.list]
    .sort((a, b) => b.notesDue + b.followUpsOverdue - (a.notesDue + a.followUpsOverdue))
    .map((c) => ({
      name: c.name,
      overdue: c.notesOverdue,
      drafts: c.draftsAwaiting,
      followUps: c.followUpsOverdue,
    }));

  return (
    <>
      <FilterBar
        aside={`Showing ${s.list.length} clinicians · ${s.active} clients · ${s.fte.toFixed(1)} FTE`}
      >
        <FilterField label="Site">
          <Segmented
            label="Site"
            value={site}
            onChange={setSite}
            options={[
              { id: "all", label: "All sites" },
              { id: "Brisbane North", label: "Brisbane North" },
              { id: "Brisbane South", label: "Brisbane South" },
            ]}
          />
        </FilterField>
        <FilterField label="Discipline">
          <Segmented
            label="Discipline"
            value={discipline}
            onChange={setDiscipline}
            options={[
              { id: "all", label: "All" },
              { id: "Occupational Therapy", label: "Occupational Therapy" },
              { id: "Speech Pathology", label: "Speech Pathology" },
            ]}
          />
        </FilterField>
        <FilterField label="Trend period">
          <Segmented
            label="Trend period"
            value={period}
            onChange={setPeriod}
            options={[
              { id: "6", label: "6 weeks" },
              { id: "12", label: "12 weeks" },
            ]}
          />
        </FilterField>
      </FilterBar>

      <KpiGrid kpis={s.kpis} label="Organisation indicators" />
      <TrendCards cards={cards} periodLabel={periodLabel} />

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
        <CaseloadHealth list={s.list} period={n} />
        <AttentionPanel list={s.list} attention={s.attention} />
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card
          aria-labelledby="caseload-trend"
          className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7"
        >
          <CardTitle
            id="caseload-trend"
            title="Active clients against capacity"
            description={`Weekly active clients · ${labels[0]} – ${labels[labels.length - 1]}`}
            aside={
              <span className="headline text-stat-sm text-over">
                {Math.round((s.active / Math.max(s.capacity, 1)) * 100)}%
              </span>
            }
          />
          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            <TrendChart
              label="Active clients against configured capacity"
              data={caseloadTrend}
              xKey="week"
              height="fill"
              series={[
                { key: "active", label: "Active clients", colour: colour.accent, kind: "area" },
              ]}
              references={[{ y: s.capacity, label: `Capacity ${s.capacity}` }]}
              tooltipTitle={(w) => `Week of ${w}`}
            />
          </div>
        </Card>

        <Card aria-labelledby="client-mix" className="px-6 pt-5 pb-5 lg:col-span-5">
          <CardTitle
            id="client-mix"
            title="Client mix"
            description="Funding stream and complexity of active clients"
          />
          <div className="mt-4">
            <DonutChart
              label="Clients by funding stream"
              centre={s.active}
              centreCaption="active clients"
              slices={[
                { id: "ndis", label: "NDIS", value: s.ndis, colour: colour.series1 },
                { id: "aged", label: "Aged care", value: s.agedCare, colour: colour.series2 },
              ]}
            />
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="eyebrow">Complexity mix</span>
              <Caption>Weighted Low 1.0 · Medium 1.5 · High 2.5</Caption>
            </div>
            <ComplexityBar high={s.mix.high} medium={s.mix.medium} low={s.mix.low} />
          </div>
        </Card>

        <Card aria-labelledby="pressure" className="px-6 pt-5 pb-4 lg:col-span-6">
          <CardTitle
            id="pressure"
            title="Caseload pressure by clinician"
            description="Caseload health score · Monitor from 60 · At Risk from 80"
          />
          <div className="mt-3">
            <BarList
              label="Caseload health score by clinician"
              data={pressure}
              domain={[0, 100]}
              unit="score"
              references={[
                { x: scoreThresholds.monitor, label: "60" },
                { x: scoreThresholds.atRisk, label: "80", tone: "over" },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="backlog" className="px-6 pt-5 pb-4 lg:col-span-6">
          <CardTitle
            id="backlog"
            title="Admin backlog by clinician"
            description="Overdue notes, AI drafts awaiting approval and overdue follow-ups"
          />
          <div className="mt-3">
            {backlog.length ? (
              <StackedColumns
                label="Admin backlog by clinician"
                layout="vertical"
                height={backlog.length * 30 + 28}
                data={backlog}
                xKey="name"
                series={[
                  { key: "overdue", label: "Notes overdue", colour: colour.series1 },
                  { key: "drafts", label: "AI drafts awaiting", colour: colour.series2 },
                  { key: "followUps", label: "Follow-ups overdue", colour: colour.series3 },
                ]}
              />
            ) : (
              <p className="py-6 text-small text-ink-500">No backlog for this selection.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function ComplexityBar({ high, medium, low }: { high: number; medium: number; low: number }) {
  const total = high + medium + low || 1;
  const parts = [
    { label: "High", value: high, colour: colour.over },
    { label: "Medium", value: medium, colour: colour.sand },
    { label: "Low", value: low, colour: colour.sage },
  ];
  return (
    <div>
      <div
        className="flex h-3 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}
      >
        {parts.map((p) => (
          <span
            key={p.label}
            title={`${p.label}: ${p.value} clients`}
            style={{ flex: p.value, backgroundColor: p.colour }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-small">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-xs"
              style={{ backgroundColor: p.colour }}
            />
            <span className="text-ink-700">{p.label}</span>
            <span className="font-semibold">{p.value}</span>
            <span className="text-ink-500">{Math.round((p.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
