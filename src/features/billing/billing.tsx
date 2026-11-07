"use client";

import { Check, Download, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiMark } from "@/components/ai/marks";
import { draftSurface } from "@/components/ai/provenance";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Avatar, Stepper } from "@/components/ui/premium";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { StatRow } from "@/components/ui/stat-row";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { caseNotes } from "@/data/case-note";
import { clinicians } from "@/data/clinicians";
import { sampleClaimRate } from "@/data/operations";
import { liveDirectory } from "@/data/records";
import { formatTime, scheduleDays, type ScheduleItem } from "@/data/schedule";
import type { Funding } from "@/data/types";
import { seedFrom } from "@/data/weeks";
import { useLiveVisits } from "@/features/clients/client-record";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { useStoryAi } from "@/state/use-story-ai";

const COLUMNS = "minmax(190px,1.4fr) 130px minmax(130px,1fr) 90px 80px 90px 120px";
const money = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;
const fundings: Funding[] = ["NDIS", "Aged care"];
const steps = ["Needs approval", "Approved", "Submitted"];
const statuses = ["draft", "approved", "submitted"] as const;
const clinicianName = (id: string) => clinicians.find((c) => c.id === id)?.name ?? "";

type Line = { visit: ScheduleItem; funding: Funding; amount: number; needsNote: boolean };

function downloadCsv(lines: Line[]) {
  const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ["Client", "Day", "Time", "Clinician", "Funding", "Minutes", "Amount", "Status"],
    ...lines.map((l) => [
      l.visit.title,
      scheduleDays[l.visit.day]?.label ?? "",
      formatTime(l.visit.start),
      clinicianName(l.visit.clinicianId),
      l.funding,
      l.visit.duration,
      Math.round(l.amount),
      l.needsNote ? "Needs note" : "Ready",
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.map(quote).join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "medisense-claims.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/** Claim lines are worked out by rules from completed visits. A person approves each batch. */
export function Billing() {
  const visits = useLiveVisits();
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const tasks = useDemoStore((s) => s.tasks);
  const noteStates = useDemoStore((s) => s.caseNotes);
  const ops = useDemoStore((s) => s.ops);
  const setOp = useDemoStore((s) => s.setOp);
  const [filter, setFilter] = useState<"all" | "ready" | "note">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const directory = liveDirectory(added, edits);
  const notApproved = new Set(
    caseNotes.filter((n) => noteStates[n.id]?.mode !== "approved").map((n) => n.client),
  );

  const lines: Line[] = visits
    .filter((v) => v.status === "completed" && (v.type === "Home visit" || v.type === "Telehealth"))
    .map((v) => {
      const funding: Funding =
        directory.find((c) => c.name === v.title)?.funding ??
        (seedFrom(v.title) % 3 === 0 ? "Aged care" : "NDIS");
      return {
        visit: v,
        funding,
        amount: (v.duration / 60) * sampleClaimRate[funding],
        needsNote:
          notApproved.has(v.title) || tasks.some((t) => t.id === `t-note-${v.id}` && !t.done),
      };
    });

  const ready = lines.filter((l) => !l.needsNote);
  const statusOf = (f: Funding) => (ops[`claim:${f}`] ?? "draft") as (typeof statuses)[number];
  const total = (list: Line[]) => list.reduce((s, l) => s + l.amount, 0);
  const submitted = ready.filter((l) => statusOf(l.funding) === "submitted");

  const facts = {
    sessionsCompleted: lines.length,
    readyToClaim: ready.length,
    waitingForANote: lines.length - ready.length,
    readyValueInDollars: Math.round(total(ready)),
  };
  const summary = useStoryAi<string>(
    `claims:${JSON.stringify(facts)}`,
    { kind: "claims", facts },
    `${ready.length} of ${lines.length} completed sessions are ready to review. ${lines.length - ready.length} are waiting for an approved note.`,
  );

  const rows = lines
    .filter((l) => (filter === "ready" ? !l.needsNote : filter === "note" ? l.needsNote : true))
    .filter((l) =>
      `${l.visit.title} ${clinicianName(l.visit.clinicianId)}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const open = lines.find((l) => l.visit.id === openId);

  const byDay = scheduleDays.map((d) => ({
    day: d.short,
    ndis: lines.filter((l) => l.visit.day === d.id && l.funding === "NDIS").length,
    aged: lines.filter((l) => l.visit.day === d.id && l.funding === "Aged care").length,
  }));
  const ndisTotal = total(lines.filter((l) => l.funding === "NDIS"));
  const agedTotal = total(lines.filter((l) => l.funding === "Aged care"));

  return (
    <>
      <StatRow
        label="Claims summary"
        stats={[
          { label: "Sessions completed", value: lines.length, caption: "This week" },
          {
            label: "Ready to claim",
            value: money(total(ready)),
            caption: `${ready.length} sessions`,
          },
          {
            label: "Waiting for a note",
            value: lines.length - ready.length,
            caption: "Held back until approved",
          },
          {
            label: "Submitted",
            value: money(total(submitted)),
            caption: `${submitted.length} sessions`,
          },
        ]}
      />

      <section className={cn(draftSurface(false), "mt-6 px-5 py-4")}>
        <AiMark>AI claims summary, recommendation only</AiMark>
        <p className="mt-1.5 headline text-section font-normal" aria-busy={summary.loading}>
          {summary.loading ? "AI is reading this week's sessions…" : summary.data}
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Card aria-labelledby="claims-day" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle id="claims-day" title="Sessions by day" description="Completed, by funding" />
          <div className="mt-3">
            <StackedColumns
              label="Completed sessions by day"
              height={220}
              data={byDay}
              xKey="day"
              series={[
                { key: "ndis", label: "NDIS", colour: colour.series1 },
                { key: "aged", label: "Aged care", colour: colour.series2 },
              ]}
            />
          </div>
        </Card>
        <Card aria-labelledby="claims-mix" className="px-6 pt-5 pb-5 lg:col-span-5">
          <CardTitle id="claims-mix" title="Value by funding" />
          <div className="mt-4">
            <DonutChart
              label="Claim value by funding"
              size={150}
              centre={money(ndisTotal + agedTotal)}
              centreCaption="total"
              format={money}
              slices={[
                { id: "ndis", label: "NDIS", value: ndisTotal, colour: colour.series1 },
                { id: "aged", label: "Aged care", value: agedTotal, colour: colour.series2 },
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {fundings.map((f) => {
          const batch = ready.filter((l) => l.funding === f);
          const held = lines.filter((l) => l.funding === f && l.needsNote).length;
          const status = statusOf(f);
          return (
            <Card key={f} aria-labelledby={`batch-${f}`} className="px-5 py-5">
              <CardTitle
                id={`batch-${f}`}
                title={`${f} batch`}
                description={`${batch.length} sessions, ${money(total(batch))}${held ? `, ${held} held back` : ""}`}
              />
              <div className="my-4">
                <Stepper steps={steps} current={statuses.indexOf(status)} />
              </div>
              {status === "submitted" ? (
                <p className="flex items-center gap-1.5 text-small font-semibold text-healthy">
                  <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                  Batch marked as submitted
                </p>
              ) : (
                <Button
                  variant="primary"
                  disabled={batch.length === 0}
                  onClick={() =>
                    setOp(
                      `claim:${f}`,
                      status === "draft" ? "approved" : "submitted",
                      status === "draft" ? "Approved claim batch" : "Marked claim batch submitted",
                      `${f}, ${batch.length} sessions`,
                    )
                  }
                >
                  {status === "draft" ? "Approve batch" : "Mark as submitted"}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <Card aria-labelledby="claim-lines" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="claim-lines"
            title="Claim lines"
            aside={
              <Button onClick={() => downloadCsv(rows)}>
                <Download className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Export CSV
              </Button>
            }
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Segmented
              label="Show"
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "ready", label: "Ready" },
                { id: "note", label: "Waiting for a note" },
              ]}
            />
            <label className="relative">
              <Search
                className="absolute top-2.5 left-3 size-4 text-ink-500"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                aria-label="Search claim lines"
                placeholder="Search client or clinician"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-64 max-w-full rounded-control border border-border bg-surface pr-3 pl-9 text-small outline-none focus:border-accent"
              />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto" role="table" aria-label="Claim lines">
          <div className="min-w-220">
            <TableHeader columns={COLUMNS}>
              <div>Client</div>
              <div>When</div>
              <div>Clinician</div>
              <div>Funding</div>
              <div>Minutes</div>
              <div>Amount</div>
              <div>Status</div>
            </TableHeader>
            {rows.map((l) => (
              <TableRow key={l.visit.id} columns={COLUMNS}>
                <div className="flex min-w-0 items-center gap-2.5 py-2">
                  <Avatar name={l.visit.title} size={32} />
                  <button
                    type="button"
                    onClick={() => setOpenId(l.visit.id)}
                    className="cursor-pointer truncate text-left font-semibold text-ink-900 hover:text-accent"
                  >
                    {l.visit.title}
                  </button>
                </div>
                <div className="text-ink-700">
                  {scheduleDays[l.visit.day]?.short} {formatTime(l.visit.start)}
                </div>
                <div className="truncate text-ink-700">{clinicianName(l.visit.clinicianId)}</div>
                <div className="text-ink-700">{l.funding}</div>
                <div className="text-ink-700">{l.visit.duration}</div>
                <div className="font-semibold">{money(l.amount)}</div>
                <div>
                  <Tag tone={l.needsNote ? "monitor" : "healthy"}>
                    {l.needsNote ? "Needs note" : "Ready"}
                  </Tag>
                </div>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <p className="px-4 py-6 text-small text-ink-500">No claim lines match.</p>
            )}
          </div>
        </div>
        <Caption className="px-5 py-3">
          Amounts use sample rates. Claims aren&apos;t sent anywhere until a claims system is
          connected.
        </Caption>
      </Card>

      {open && (
        <Sheet
          title={open.visit.title}
          description={`${open.funding} claim line`}
          onClose={() => setOpenId(null)}
        >
          <dl className="divide-y divide-border">
            {[
              ["When", `${scheduleDays[open.visit.day]?.label}, ${formatTime(open.visit.start)}`],
              ["Service type", open.visit.type],
              ["Clinician", clinicianName(open.visit.clinicianId)],
              ["Minutes", String(open.visit.duration)],
              ["Sample rate", `${money(sampleClaimRate[open.funding])} an hour`],
              ["Amount", money(open.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2.5 text-small">
                <dt className="text-ink-500">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {open.needsNote ? (
            <p className="mt-4 rounded-control bg-monitor-bg px-3.5 py-3 text-small text-monitor">
              Held back: the session note isn&apos;t approved yet.{" "}
              <Link href="/tasks" className="font-semibold">
                View tasks
              </Link>
            </p>
          ) : (
            <p className="mt-4 rounded-control bg-healthy-bg px-3.5 py-3 text-small text-healthy">
              Ready for the {open.funding} batch.
            </p>
          )}
        </Sheet>
      )}
    </>
  );
}
