"use client";

import { ArrowRight, Check, CircleDashed, Sparkles } from "lucide-react";
import { useState } from "react";
import { DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { TrendChart } from "@/components/charts/trend-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { SearchField } from "@/components/ui/search-field";
import { FilterBar, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  libraryReports,
  reportStatuses,
  reportTemplates,
  reportTypes,
  turnaroundByWeek,
  type LibraryReport,
  type ReportStatus,
} from "@/data/reports-library";
import { weeks } from "@/data/weeks";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const COLUMNS = "minmax(160px,1.3fr) minmax(200px,1.6fr) minmax(130px,1fr) 112px 112px";

const statusTone: Record<ReportStatus, TagTone> = {
  "Not started": "neutral",
  "AI draft": "live",
  "In review": "monitor",
  Approved: "healthy",
  Sent: "outline",
};

const statusColour: Record<ReportStatus, string> = {
  "Not started": colour.stone,
  "AI draft": colour.series2,
  "In review": colour.monitor,
  Approved: colour.series1,
  Sent: colour.series3,
};

function dueLabel(r: LibraryReport, status: ReportStatus) {
  if (status === "Sent" || status === "Approved") return { text: r.due, tone: "text-ink-500" };
  if (r.dueInDays < 0) return { text: `${-r.dueInDays}d overdue`, tone: "font-semibold text-over" };
  if (r.dueInDays <= 7)
    return { text: `${r.due} · ${r.dueInDays}d`, tone: "font-semibold text-ink-900" };
  return { text: r.due, tone: "text-ink-700" };
}

export function ReportsLibrary() {
  const stored = useDemoStore((s) => s.reports);
  const emilyApproved = useDemoStore((s) => s.report.approved);
  const draftReport = useDemoStore((s) => s.draftReport);
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [type, setType] = useState("all");
  const [clinician, setClinician] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("daniel-lee");

  const statusOf = (r: LibraryReport): ReportStatus =>
    r.id === "emily-carter" && emilyApproved ? "Approved" : (stored[r.id] ?? r.status);

  const reports = libraryReports.map((r) => ({ ...r, current: statusOf(r) }));
  const open = reports.filter((r) => r.current !== "Sent" && r.current !== "Approved");
  const clinicianNames = [...new Set(reports.map((r) => r.clinician))].sort();

  const rows = reports
    .filter((r) => !status || r.current === status)
    .filter((r) => type === "all" || r.type === type)
    .filter((r) => clinician === "all" || r.clinician === clinician)
    .filter((r) => `${r.client} ${r.type}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.dueInDays - b.dueInDays);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const metrics = [
    {
      label: "Due in 14 days",
      value: open.filter((r) => r.dueInDays >= 0 && r.dueInDays <= 14).length,
      caption: "Not yet approved",
    },
    {
      label: "Overdue",
      value: open.filter((r) => r.dueInDays < 0).length,
      caption: "Past the due date",
      over: true,
    },
    {
      label: "AI drafts waiting",
      value: reports.filter((r) => r.current === "AI draft").length,
      caption: "Need clinician review",
    },
    {
      label: "Not started",
      value: reports.filter((r) => r.current === "Not started").length,
      caption: "Draft in one click",
    },
    {
      label: "Days to send",
      value: turnaroundByWeek.at(-1) ?? 0,
      caption: `Down from ${turnaroundByWeek[0]} in August`,
    },
  ];

  const buckets = [
    { label: "Overdue", test: (d: number) => d < 0 },
    { label: "This week", test: (d: number) => d >= 0 && d <= 6 },
    { label: "Next week", test: (d: number) => d >= 7 && d <= 13 },
    { label: "2–3 weeks", test: (d: number) => d >= 14 && d <= 27 },
    { label: "4+ weeks", test: (d: number) => d >= 28 },
  ].map((b) => ({
    bucket: b.label,
    notStarted: open.filter((r) => b.test(r.dueInDays) && r.current === "Not started").length,
    drafted: open.filter((r) => b.test(r.dueInDays) && r.current !== "Not started").length,
  }));

  return (
    <>
      <section
        aria-label="Report summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span
              className={cn("headline text-stat font-normal", m.over && m.value > 0 && "text-over")}
            >
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="by-status" className="flex flex-col px-6 pt-5 pb-5 lg:col-span-4">
          <CardTitle
            id="by-status"
            title="By status"
            description="Click a slice to filter the list"
          />
          <div className="mt-5">
            <DonutChart
              label="Reports by status"
              size={156}
              centre={reports.length}
              centreCaption="reports"
              selected={status}
              onSelect={(id) => setStatus(id as ReportStatus | null)}
              slices={reportStatuses.map((s) => ({
                id: s,
                label: s,
                value: reports.filter((r) => r.current === s).length,
                colour: statusColour[s],
              }))}
            />
          </div>
        </Card>

        <Card aria-labelledby="due-ahead" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-4">
          <CardTitle id="due-ahead" title="Due ahead" description="Open reports by due date" />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Open reports by due date"
              height="fill"
              data={buckets}
              xKey="bucket"
              series={[
                { key: "drafted", label: "Drafted or in review", colour: colour.series2 },
                { key: "notStarted", label: "Not started", colour: colour.stone },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="turnaround" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-4">
          <CardTitle
            id="turnaround"
            title="Turnaround"
            description="Working days from request to sent"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Report turnaround in working days"
              height="fill"
              data={weeks.map((w, i) => ({ week: w, days: turnaroundByWeek[i] ?? 0 }))}
              xKey="week"
              domain={[0, 16]}
              format={(v) => `${v} days`}
              references={[{ y: 10, label: "Target 10 days" }]}
              series={[
                { key: "days", label: "Days to send", colour: colour.series1, kind: "area" },
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <FilterBar aside={`Showing ${rows.length} of ${reports.length}`}>
          <SelectField
            label="Status"
            value={status ?? "all"}
            onChange={(v) => setStatus(v === "all" ? null : (v as ReportStatus))}
          >
            <option value="all">All statuses</option>
            {reportStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <SelectField label="Type" value={type} onChange={setType}>
            <option value="all">All types</option>
            {reportTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </SelectField>
          <SelectField label="Clinician" value={clinician} onChange={setClinician}>
            <option value="all">Everyone</option>
            {clinicianNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </SelectField>
          <SearchField
            label="Search reports"
            placeholder="Search clients or report types"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <Card aria-label="Reports" className="overflow-hidden lg:col-span-8">
          <div className="overflow-x-auto" role="table" aria-label="Reports">
            <div className="min-w-180">
              <TableHeader columns={COLUMNS}>
                <div>Client</div>
                <div>Report</div>
                <div>Clinician</div>
                <div>Due</div>
                <div>Status</div>
              </TableHeader>
              {rows.map((r) => {
                const due = dueLabel(r, r.current);
                return (
                  <TableRow
                    key={r.id}
                    columns={COLUMNS}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "cursor-pointer",
                      r.id === selected?.id && "bg-accent-tint/50 hover:bg-accent-tint/50",
                    )}
                  >
                    <div className="py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className="cursor-pointer text-left font-semibold text-ink-900 hover:text-accent"
                      >
                        {r.client}
                      </button>
                    </div>
                    <div className="text-ink-700">{r.type}</div>
                    <div className="text-ink-700">{r.clinician}</div>
                    <div className={due.tone}>{due.text}</div>
                    <div>
                      <Tag tone={statusTone[r.current]}>{r.current}</Tag>
                    </div>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <p className="px-4 py-6 text-small text-ink-500">No reports match these filters.</p>
              )}
            </div>
          </div>
        </Card>

        {selected && (
          <div
            className={cn(
              draftSurface(selected.current === "Approved" || selected.current === "Sent"),
              "flex flex-col gap-3 px-5 py-5 lg:sticky lg:top-6 lg:col-span-4",
            )}
          >
            {selected.current === "Not started" ? (
              <span className="eyebrow">Not started</span>
            ) : selected.current === "Approved" || selected.current === "Sent" ? (
              <span className="flex items-center gap-1.5 text-small font-semibold text-healthy">
                <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                {selected.current} by {selected.clinician}
              </span>
            ) : (
              <DraftLabel>AI draft — clinician review required</DraftLabel>
            )}
            <div>
              <h2 className="headline text-h2">{selected.client}</h2>
              <Caption className="mt-1">
                {selected.type} · {selected.funding} · {selected.clinician} · due {selected.due}
              </Caption>
            </div>
            <div className="border-t border-border pt-3">
              <div className="mb-1.5 eyebrow">Sections</div>
              <ul className="flex flex-col gap-1">
                {selected.sections.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-small">
                    {selected.current === "Not started" ? (
                      <CircleDashed
                        className="size-3.5 text-ink-400"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <Check className="size-3.5 text-healthy" strokeWidth={2} aria-hidden="true" />
                    )}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-border pt-3">
              <div className="mb-1.5 eyebrow">Built from</div>
              <ul className="flex flex-col gap-1">
                {selected.sources.map((s) => (
                  <li key={s.label} className="flex justify-between text-small">
                    <span className="text-ink-700">{s.label}</span>
                    <b className="font-semibold">{s.count}</b>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 border-t border-border pt-3">
              {selected.current === "Not started" && (
                <Button variant="primary" onClick={() => draftReport(selected.id)}>
                  <Sparkles className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  Generate AI draft
                </Button>
              )}
              {selected.href && (
                <ButtonLink
                  href={selected.href}
                  variant={selected.current === "Not started" ? "secondary" : "primary"}
                >
                  Open report
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </ButtonLink>
              )}
              {!selected.href && selected.current === "AI draft" && (
                <Caption className="flex items-center gap-1.5">
                  <PenNib className="size-3.5 text-brass" />
                  Draft ready for {selected.clinician.split(" ")[0]} to review. Emily Carter&apos;s
                  report shows the full review flow.
                </Caption>
              )}
            </div>
          </div>
        )}
      </div>

      <Card aria-labelledby="templates" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="templates"
            title="Templates"
            description="Medisense's own report formats; AI fills them from approved records only"
          />
        </div>
        <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {reportTemplates.map((t) => (
            <div key={t.name} className="flex flex-col gap-1 bg-surface px-4 py-3.5">
              <span className="text-small font-semibold">{t.name}</span>
              <Caption>
                {t.sections} sections · updated {t.updated}
              </Caption>
              <span className="mt-1 text-caption font-semibold text-accent">
                {t.uses} uses this year
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
