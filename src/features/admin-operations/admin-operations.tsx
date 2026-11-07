"use client";

import { ArrowRight, BellRing, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { FilterBar, FilterField, Segmented } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  adminQueueByWeek,
  expiriesByMonth,
  expiryItems,
  staffCompliance,
  staffRequirements,
  stateFor,
  type ComplianceState,
} from "@/data/admin-operations";
import { formDrafts } from "@/data/forms";
import { referrals } from "@/data/referrals";
import { weeks } from "@/data/weeks";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const COLUMNS = "minmax(220px,1.6fr) minmax(150px,1fr) minmax(130px,1fr) 128px 128px 150px";

const stateTone: Record<ComplianceState, TagTone> = {
  Expired: "over",
  "Due ≤30 days": "monitor",
  "Due ≤60 days": "available",
  Current: "healthy",
};

type StateFilter = "all" | ComplianceState;

export function AdminOperations() {
  const reminders = useDemoStore((s) => s.reminders);
  const sendReminders = useDemoStore((s) => s.sendReminders);
  const referralStatus = useDemoStore((s) => s.referrals);
  const forms = useDemoStore((s) => s.forms);
  const tasks = useDemoStore((s) => s.tasks);
  const [kind, setKind] = useState<"all" | "Client" | "Staff">("all");
  const [state, setState] = useState<StateFilter>("all");

  const urgent = expiryItems.filter((i) => i.daysLeft <= 30);
  const unsentUrgent = urgent.filter((i) => !reminders.includes(i.id));
  const compliantStaff = staffCompliance.filter(({ items }) => items.every((i) => i.daysLeft > 30));

  const rows = expiryItems
    .filter((i) => kind === "all" || i.kind === kind)
    .filter((i) => state === "all" || stateFor(i.daysLeft) === state);

  const queues = [
    {
      label: "Referrals to process",
      value: referrals.filter(
        (r) =>
          !["Profile created", "Merged", "First visit booked"].includes(
            referralStatus[r.id] ?? r.status,
          ),
      ).length,
      href: "/intake",
    },
    {
      label: "Forms not submitted",
      value: formDrafts.filter((f) => forms[f.id]?.status !== "submitted").length,
      href: "/forms",
    },
    {
      label: "Document requests open",
      value: tasks.filter((t) => t.type === "Document request" && !t.done).length,
      href: "/tasks",
    },
    { label: "Expiries in 30 days", value: urgent.length, href: "#expiries" },
  ];

  const metrics = [
    {
      label: "Expired",
      value: expiryItems.filter((i) => i.daysLeft < 0).length,
      caption: "Act today",
      over: true,
    },
    {
      label: "Due in 30 days",
      value: expiryItems.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30).length,
      caption: "Client and staff",
    },
    {
      label: "Due in 31–60 days",
      value: expiryItems.filter((i) => i.daysLeft > 30 && i.daysLeft <= 60).length,
      caption: "On the radar",
    },
    {
      label: "Staff fully current",
      value: `${compliantStaff.length} of ${staffCompliance.length}`,
      caption: "Nothing due in 30 days",
    },
    { label: "Reminders sent", value: reminders.length, caption: "Today, logged to audit" },
  ];

  return (
    <>
      <section aria-label="Today's queues" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {queues.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="group flex items-center justify-between rounded-card border border-border bg-surface px-5 py-4 surface-lift hover:border-border-strong hover:no-underline"
          >
            <span>
              <span className="block eyebrow">{q.label}</span>
              <span className="headline text-stat font-normal text-ink-900">{q.value}</span>
            </span>
            <ArrowRight
              className="size-4 text-ink-400 group-hover:text-accent"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        ))}
      </section>

      <section
        aria-label="Compliance summary"
        className="stat-band mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
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
          aria-labelledby="expiries-month"
          className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5"
        >
          <CardTitle
            id="expiries-month"
            title="Expiries ahead"
            description="Plans, agreements, consents and staff checks · all clients and staff"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Expiries by month"
              height="fill"
              data={expiriesByMonth}
              xKey="month"
              series={[
                { key: "client", label: "Client documents", colour: colour.series1 },
                { key: "staff", label: "Staff checks", colour: colour.series2 },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="admin-volume" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle
            id="admin-volume"
            title="Admin requests handled"
            description="Per week, last 12 weeks · volume is rising with the caseload"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Admin requests per week"
              height="fill"
              data={weeks.map((w, i) => ({ week: w, ...adminQueueByWeek[i] }))}
              xKey="week"
              series={[
                { key: "referrals", label: "Referrals", colour: colour.series1 },
                { key: "documents", label: "Documents", colour: colour.series2 },
                { key: "forms", label: "Forms", colour: colour.series3 },
                { key: "scheduling", label: "Scheduling", colour: colour.series4 },
              ]}
            />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="staff-compliance" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="staff-compliance"
            title="Staff compliance"
            description="Checks every clinician needs for home visits in Queensland"
          />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-240">
            <div className="grid grid-cols-[200px_repeat(5,minmax(0,1fr))] border-y border-border bg-surface-sunken px-5 py-2 eyebrow">
              <span>Clinician</span>
              {staffRequirements.map((r) => (
                <span key={r.id} title={r.detail}>
                  {r.label}
                </span>
              ))}
            </div>
            {staffCompliance.map(({ clinician, items }) => (
              <div
                key={clinician.id}
                className="grid grid-cols-[200px_repeat(5,minmax(0,1fr))] items-center border-b border-border px-5 py-2"
              >
                <span>
                  <span className="block text-small font-semibold">{clinician.name}</span>
                  <Caption>{clinician.discipline}</Caption>
                </span>
                {items.map((i) => (
                  <span key={i.id} className="flex flex-col items-start gap-0.5">
                    <Tag tone={stateTone[i.state]}>
                      {i.state === "Current" ? "Current" : i.state}
                    </Tag>
                    <span className="text-eyebrow text-ink-500">
                      {i.daysLeft < 0 ? `Expired ${i.expires}` : i.expires}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div id="expiries" className="mt-6 scroll-mt-6">
        <FilterBar
          aside={
            <Button
              size="sm"
              variant="primary"
              disabled={unsentUrgent.length === 0}
              onClick={() => sendReminders(unsentUrgent.map((i) => i.id))}
            >
              <BellRing className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              {unsentUrgent.length
                ? `Send ${unsentUrgent.length} reminders due ≤30 days`
                : "All urgent reminders sent"}
            </Button>
          }
        >
          <FilterField label="Show">
            <Segmented
              label="Kind"
              value={kind}
              onChange={setKind}
              options={[
                { id: "all", label: "All" },
                { id: "Client", label: "Client documents" },
                { id: "Staff", label: "Staff checks" },
              ]}
            />
          </FilterField>
          <FilterChips
            label="Filter by state"
            value={state}
            onChange={setState}
            options={[
              { id: "all" as const, label: "Any date" },
              { id: "Expired" as const, label: "Expired" },
              { id: "Due ≤30 days" as const, label: "≤30 days" },
              { id: "Due ≤60 days" as const, label: "31–60 days" },
            ]}
          />
        </FilterBar>
      </div>

      <Card aria-label="Expiry worklist" className="overflow-hidden">
        <div className="overflow-x-auto" role="table" aria-label="Expiry worklist">
          <div className="min-w-220">
            <TableHeader columns={COLUMNS}>
              <div>Item</div>
              <div>Who</div>
              <div>Owner</div>
              <div>Date</div>
              <div>State</div>
              <div className="text-right">Action</div>
            </TableHeader>
            {rows.map((i) => {
              const s = stateFor(i.daysLeft);
              const sent = reminders.includes(i.id);
              return (
                <TableRow
                  key={i.id}
                  columns={COLUMNS}
                  className={cn(s === "Expired" && "shadow-rule-over")}
                >
                  <div className="py-2">
                    <span className="block font-semibold">{i.category}</span>
                    <Caption>{i.kind === "Client" ? "Client document" : "Staff check"}</Caption>
                  </div>
                  <div className="text-ink-700">{i.subject}</div>
                  <div className="text-ink-700">{i.owner}</div>
                  <div className={cn(s === "Expired" ? "font-semibold text-over" : "text-ink-700")}>
                    {i.expires}
                    <span className="block text-caption font-medium">
                      {i.daysLeft < 0
                        ? `${-i.daysLeft}d ago`
                        : i.daysLeft === 0
                          ? "Today"
                          : `In ${i.daysLeft}d`}
                    </span>
                  </div>
                  <div>
                    <Tag tone={stateTone[s]}>{s}</Tag>
                  </div>
                  <div className="text-right">
                    {sent ? (
                      <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        Reminder sent
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => sendReminders([i.id])}>
                        Send reminder
                      </Button>
                    )}
                  </div>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <p className="px-4 py-6 text-small text-ink-500">Nothing matches.</p>
            )}
          </div>
        </div>
        <Caption className="px-4 pt-3 pb-3.5">
          Reminders go to the owner shown. Messages to clients or families are drafted for the admin
          team to review before sending.
        </Caption>
      </Card>
    </>
  );
}
