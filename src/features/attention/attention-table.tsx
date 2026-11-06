"use client";

import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { LevelDot } from "@/components/ui/dot";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchField } from "@/components/ui/search-field";
import { Segmented, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { PriorityTag, Tag } from "@/components/ui/tag";
import {
  attentionClients,
  attentionClinicians,
  contactBuckets,
  countByPriority,
  countByReason,
  inBucket,
  mostCommonReason,
  priorities,
  reasonTypeLabels,
  reasonTypes,
  type ContactBucket,
} from "@/data/attention";
import type { Funding, Priority, ReasonType } from "@/data/types";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { AssignFollowUpPopover } from "./assign-follow-up";

const COLUMNS = "minmax(140px,1.1fr) minmax(130px,1fr) 84px 92px minmax(240px,2.4fr) 96px 168px";

const priorityColour: Record<Priority, string> = {
  High: colour.over,
  Medium: colour.monitor,
  Review: colour.stone,
};

export function AttentionWorkspace() {
  const followUps = useDemoStore((s) => s.followUps);
  const assignFollowUp = useDemoStore((s) => s.assignFollowUp);
  const latest = followUps[0];
  const latestIsSarahs =
    attentionClients.find((c) => c.id === latest?.clientId)?.clinician === "Sarah Thompson";

  const [openFor, setOpenFor] = useState<string | null>(null);
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [reason, setReason] = useState<ReasonType | null>(null);
  const [clinician, setClinician] = useState<string | null>(null);
  const [bucket, setBucket] = useState<ContactBucket | null>(null);
  const [funding, setFunding] = useState<"all" | Funding>("all");
  const [query, setQuery] = useState("");
  const close = useCallback(() => setOpenFor(null), []);

  const rows = attentionClients
    .filter((c) => priority === "all" || c.priority === priority)
    .filter((c) => !reason || c.reasonTypes.includes(reason))
    .filter((c) => !clinician || c.clinician === clinician)
    .filter((c) => !bucket || inBucket(c.daysSinceContact, bucket))
    .filter((c) => funding === "all" || c.funding === funding)
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  const filtersActive =
    priority !== "all" || reason || clinician || bucket || funding !== "all" || query;
  const clearAll = () => {
    setPriority("all");
    setReason(null);
    setClinician(null);
    setBucket(null);
    setFunding("all");
    setQuery("");
  };

  const topReason = mostCommonReason(attentionClients);
  const assigned = followUps.filter((f) => attentionClients.some((c) => c.id === f.clientId));

  const byReason = countByReason(attentionClients)
    .sort((a, b) => b.count - a.count)
    .map((r) => ({ id: r.type, label: r.label, value: r.count, colour: colour.accent }));

  const byClinician = attentionClinicians
    .map((name) => {
      const list = attentionClients.filter((c) => c.clinician === name);
      return {
        id: name,
        label: name,
        value: list.length,
        colour: list.some((c) => c.priority === "High") ? colour.over : colour.series3,
        detail: `${countByPriority(list, "High")} high · ${countByPriority(list, "Medium")} medium · ${countByPriority(list, "Review")} review`,
      };
    })
    .sort((a, b) => b.value - a.value);

  const byContact = contactBuckets.map((b, i) => ({
    id: b.id,
    label: b.label,
    value: attentionClients.filter((c) => inBucket(c.daysSinceContact, b.id)).length,
    colour: i === contactBuckets.length - 1 ? colour.over : i === 1 ? colour.monitor : colour.sage,
  }));

  return (
    <>
      <section
        aria-label="Summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.6fr)]"
      >
        <div className="flex flex-col gap-1 bg-surface px-5 py-4">
          <span className="eyebrow">Clients</span>
          <span className="headline text-stat font-normal">{attentionClients.length}</span>
        </div>
        {priorities.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={priority === p}
            onClick={() => setPriority(priority === p ? "all" : p)}
            className={cn(
              "flex cursor-pointer flex-col gap-1 bg-surface px-5 py-4 text-left hover:bg-canvas",
              priority === p && "bg-accent-tint shadow-rule-accent",
            )}
          >
            <span className="flex items-center gap-1.5 eyebrow">
              <LevelDot level={p} />
              {p}
            </span>
            <span className="headline text-stat font-normal">
              {countByPriority(attentionClients, p)}
            </span>
          </button>
        ))}
        <div className="flex flex-col gap-1 bg-surface px-5 py-4">
          <span className="eyebrow">Follow-ups assigned</span>
          <span className="headline text-stat font-normal">
            {assigned.length}
            <span className="text-figure text-ink-500"> / {attentionClients.length}</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-surface px-5 py-4">
          <span className="eyebrow">Most common reason</span>
          <span className="headline text-stat-sm leading-8 font-normal">
            {topReason.label} <span className="text-ink-500">({topReason.count})</span>
          </span>
        </div>
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-3">
        <Card aria-labelledby="by-reason" className="flex flex-col px-5 pt-5 pb-4">
          <CardTitle
            id="by-reason"
            title="By operational reason"
            description="Click a bar to filter the queue"
          />
          <div className="mt-3">
            <BarList
              label="Clients requiring review by reason"
              data={byReason}
              labelWidth={150}
              unit="clients"
              selected={reason}
              onSelect={(id) => setReason(id as ReasonType | null)}
            />
          </div>
        </Card>
        <Card aria-labelledby="by-clinician" className="flex flex-col px-5 pt-5 pb-4">
          <CardTitle
            id="by-clinician"
            title="By clinician"
            description="Clay marks a high-priority client"
          />
          <div className="mt-3">
            <BarList
              label="Clients requiring review by clinician"
              data={byClinician}
              labelWidth={120}
              unit="clients"
              selected={clinician}
              onSelect={setClinician}
            />
          </div>
        </Card>
        <Card aria-labelledby="by-contact" className="flex flex-col px-5 pt-5 pb-4">
          <CardTitle
            id="by-contact"
            title="Days since last contact"
            description="Service gaps are the earliest continuity signal"
          />
          <div className="mt-3">
            <BarList
              label="Clients by days since last contact"
              data={byContact}
              labelWidth={84}
              unit="clients"
              selected={bucket}
              onSelect={(id) => setBucket(id as ContactBucket | null)}
            />
          </div>
          <Caption className="mt-auto border-t border-border pt-3">
            Average{" "}
            {Math.round(
              attentionClients.reduce((s, c) => s + c.daysSinceContact, 0) /
                attentionClients.length,
            )}{" "}
            days · longest 21 days
          </Caption>
        </Card>
      </div>

      {latest && (
        <div
          role="status"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-healthy-bg px-4 py-3"
        >
          <span className="flex items-center gap-2 text-small font-semibold text-healthy">
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Follow-up for {latest.client} assigned to {latest.assignee} · {latest.reason} · Due{" "}
            {latest.due} · Logged to audit trail
          </span>
          {latestIsSarahs && (
            <Link
              href="/supervision/sarah-thompson"
              className="inline-flex items-center gap-1.5 text-small font-semibold"
            >
              Prepare Sarah’s supervision
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <Card aria-label="Clients requiring attention" className="mt-6">
        <div className="flex flex-col gap-3 border-b border-border px-4 pt-4 pb-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2">
                <Caption>Priority</Caption>
                <FilterChips
                  label="Filter by priority"
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { id: "all", label: "All" },
                    ...priorities.map((p) => ({
                      id: p,
                      label: p,
                      count: countByPriority(attentionClients, p),
                    })),
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <Caption>Funding</Caption>
                <Segmented
                  label="Funding"
                  value={funding}
                  onChange={setFunding}
                  options={[
                    { id: "all", label: "All" },
                    { id: "NDIS", label: "NDIS" },
                    { id: "Aged care", label: "Aged care" },
                  ]}
                />
              </div>
              <SelectField
                label="Clinician"
                value={clinician ?? "all"}
                onChange={(v) => setClinician(v === "all" ? null : v)}
              >
                <option value="all">All clinicians</option>
                {attentionClinicians.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>
            </div>
            <SearchField
              label="Search clients"
              placeholder="Search clients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Caption className="mr-0.5">Reason type</Caption>
              <FilterChips
                label="Filter by reason"
                value={reason ?? "all"}
                onChange={(v) => setReason(v === "all" ? null : v)}
                options={[
                  { id: "all" as const, label: "All reasons" },
                  ...reasonTypes.map((id) => ({ id, label: reasonTypeLabels[id] })),
                ]}
              />
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex cursor-pointer items-center gap-1 text-small font-semibold text-accent"
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="max-lg:overflow-x-auto" role="table" aria-label="Clients requiring review">
          <div className="max-lg:min-w-260">
            <TableHeader columns={COLUMNS} className="gap-x-3.5">
              <div>Client</div>
              <div>Clinician</div>
              <div>Funding</div>
              <div>Priority</div>
              <div>Operational reason</div>
              <div className="text-right">Days since contact</div>
              <div className="text-right">Action</div>
            </TableHeader>
            {rows.map((c) => {
              const done = followUps.find((f) => f.clientId === c.id);
              const open = openFor === c.id;
              return (
                <TableRow
                  key={c.id}
                  columns={COLUMNS}
                  className={cn(
                    "min-h-14 gap-x-3.5",
                    open && "z-3",
                    c.priority === "High" && "shadow-rule-over",
                  )}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-ink-700">{c.clinician}</div>
                  <div>
                    <Tag tone={c.funding === "NDIS" ? "live" : "neutral"}>{c.funding}</Tag>
                  </div>
                  <div>
                    <PriorityTag priority={c.priority} />
                  </div>
                  <div className="line-clamp-2 py-2 text-ink-700">{c.reason}</div>
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className="h-1 w-10 overflow-hidden rounded-full bg-surface-sunken"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(c.daysSinceContact / 21) * 100}%`,
                          backgroundColor: priorityColour[c.priority],
                        }}
                      />
                    </span>
                    <span className="font-serif text-figure">{c.daysSinceContact}</span>
                  </div>
                  <div className="text-right">
                    {done ? (
                      <span className="inline-flex flex-col items-end text-small font-semibold text-healthy">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                          Assigned · {done.due}
                        </span>
                        <span className="text-caption font-medium text-ink-500">
                          {done.assignee}
                        </span>
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        aria-expanded={open}
                        onClick={() => setOpenFor(open ? null : c.id)}
                        className={cn(open && "border-accent bg-accent-tint text-accent")}
                      >
                        Assign follow-up
                      </Button>
                    )}
                  </div>
                  {open && (
                    <AssignFollowUpPopover
                      client={c}
                      onCancel={close}
                      onAssign={(assignment) => {
                        assignFollowUp(assignment);
                        close();
                      }}
                    />
                  )}
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <p className="px-4 py-6 text-small text-ink-500">No clients match these filters.</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 px-4 pt-3 pb-3.5">
          <Caption>
            These indicators are operational (scheduling, documentation, funding). They are not
            clinical risk assessments.
          </Caption>
          <Caption>
            Showing {rows.length} of {attentionClients.length}
          </Caption>
        </div>
      </Card>
    </>
  );
}
