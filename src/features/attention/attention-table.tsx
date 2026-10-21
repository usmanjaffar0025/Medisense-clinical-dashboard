"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchField } from "@/components/ui/search-field";
import { TableHeader, TableRow } from "@/components/ui/table";
import { PriorityTag } from "@/components/ui/tag";
import { attentionClients, attentionClinicians, reasonTypeLabels } from "@/data/attention";
import type { Priority, ReasonType } from "@/data/types";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { AssignFollowUpPopover } from "./assign-follow-up";

const COLUMNS = "minmax(140px,1.1fr) minmax(130px,1fr) 92px minmax(240px,2.4fr) 96px 168px";

export function AttentionTable() {
  const followUps = useDemoStore((s) => s.followUps);
  const latest = followUps[0];
  const latestIsSarahs =
    attentionClients.find((c) => c.id === latest?.clientId)?.clinician === "Sarah Thompson";
  const assignFollowUp = useDemoStore((s) => s.assignFollowUp);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [reason, setReason] = useState<"all" | ReasonType>("all");
  const [clinician, setClinician] = useState("all");
  const [query, setQuery] = useState("");
  const close = useCallback(() => setOpenFor(null), []);

  const rows = attentionClients
    .filter((c) => priority === "all" || c.priority === priority)
    .filter((c) => reason === "all" || c.reasonTypes.includes(reason))
    .filter((c) => clinician === "all" || c.clinician === clinician)
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      {latest && (
        <div
          role="status"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-healthy-bg px-4 py-3"
        >
          <span className="flex items-center gap-2 text-small font-semibold text-healthy">
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Follow-up for {latest.client} assigned to {latest.assignee} · Due {latest.due} · Logged
            to audit trail
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
            <div className="flex flex-wrap items-center gap-2">
              <Caption className="mr-0.5">Priority</Caption>
              <FilterChips
                label="Filter by priority"
                value={priority}
                onChange={setPriority}
                options={[
                  { id: "all", label: "All" },
                  { id: "High", label: "High" },
                  { id: "Medium", label: "Medium" },
                  { id: "Low", label: "Low" },
                ]}
              />
              <label className="ml-3 flex items-center gap-2">
                <Caption>Clinician</Caption>
                <select
                  aria-label="Clinician"
                  value={clinician}
                  onChange={(e) => setClinician(e.target.value)}
                  className="h-7.5 rounded-control border border-border bg-surface pr-7 pl-2.5 text-small text-ink-700"
                >
                  <option value="all">All clinicians</option>
                  {attentionClinicians.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <SearchField
              label="Search clients"
              placeholder="Search clients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Caption className="mr-0.5">Reason type</Caption>
            <FilterChips
              label="Filter by reason"
              value={reason}
              onChange={setReason}
              options={[
                { id: "all", label: "All reasons" },
                ...(Object.keys(reasonTypeLabels) as ReasonType[]).map((id) => ({
                  id,
                  label: reasonTypeLabels[id],
                })),
              ]}
            />
          </div>
        </div>

        <div className="max-lg:overflow-x-auto" role="table" aria-label="Clients requiring review">
          <div className="max-lg:min-w-250">
            <TableHeader columns={COLUMNS} className="gap-x-3.5">
              <div>Client</div>
              <div>Clinician</div>
              <div>Priority</div>
              <div>Operational reason</div>
              <div className="text-right">Days since contact</div>
              <div className="text-right">Action</div>
            </TableHeader>
            {rows.map((c) => {
              const assigned = followUps.find((f) => f.clientId === c.id);
              const open = openFor === c.id;
              return (
                <TableRow
                  key={c.id}
                  columns={COLUMNS}
                  className={cn("min-h-14 gap-x-3.5", open && "z-3")}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-ink-700">{c.clinician}</div>
                  <div>
                    <PriorityTag priority={c.priority} />
                  </div>
                  <div className="line-clamp-2 py-2 text-ink-700">{c.reason}</div>
                  <div className="text-right font-serif text-figure">{c.daysSinceContact}</div>
                  <div className="text-right">
                    {assigned ? (
                      <span className="inline-flex items-center gap-1.5 text-small font-semibold text-healthy">
                        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        Assigned · {assigned.due}
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
        <Caption className="px-4 pt-3 pb-3.5">
          These indicators are operational (scheduling, documentation, funding). They are not
          clinical risk assessments.
        </Caption>
      </Card>
    </>
  );
}
