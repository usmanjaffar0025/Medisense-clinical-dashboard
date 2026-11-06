"use client";

import Link from "next/link";
import { useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { LevelDot } from "@/components/ui/dot";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchField } from "@/components/ui/search-field";
import { Segmented, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag, priorityTone } from "@/components/ui/tag";
import { tenureLabel } from "@/data/caseload";
import type {
  AttentionStatus,
  CaseloadClient,
  ClientFilter,
  Complexity,
  DocumentationStatus,
  Funding,
} from "@/data/types";

const COLUMNS =
  "minmax(130px,1.2fr) minmax(160px,1.6fr) 84px 76px 84px 128px 96px minmax(150px,1.3fr) minmax(160px,1.3fr)";

type Filter = "all" | ClientFilter;
type Sort = "attention" | "name" | "complexity" | "tenure-asc" | "tenure-desc";

const complexityRank: Record<Complexity, number> = { High: 0, Medium: 1, Low: 2 };

const sorters: Record<Sort, (a: CaseloadClient, b: CaseloadClient) => number> = {
  attention: () => 0,
  name: (a, b) => a.name.localeCompare(b.name),
  complexity: (a, b) => complexityRank[a.complexity] - complexityRank[b.complexity],
  "tenure-asc": (a, b) => a.tenureMonths - b.tenureMonths,
  "tenure-desc": (a, b) => b.tenureMonths - a.tenureMonths,
};

function NextAppointment({ value }: { value: CaseloadClient["nextAppointment"] }) {
  switch (value.kind) {
    case "not-booked":
      return <span className="text-ink-500 italic">Not booked</span>;
    case "paused":
      return <span className="text-ink-500 italic">Paused</span>;
    case "today":
      return <span className="font-semibold text-ink-900">{value.label}</span>;
    case "booked":
      return <span>{value.label}</span>;
  }
}

function Documentation({ value, href }: { value: DocumentationStatus; href?: string }) {
  switch (value.kind) {
    case "complete":
      return <span className="text-ink-500">Complete</span>;
    case "overdue":
      return href ? (
        <Link href={href} className="font-medium text-monitor underline-offset-2 hover:underline">
          Note overdue · {value.days} days
        </Link>
      ) : (
        <span className="font-medium text-monitor">Note overdue · {value.days} days</span>
      );
    case "report-incomplete":
      return <span className="font-medium text-monitor">Progress report incomplete</span>;
    case "ai-draft": {
      const label = (
        <>
          <PenNib className="text-brass" />
          AI draft awaiting review
        </>
      );
      return href ? (
        <Link href={href} className="inline-flex items-center gap-1.5 font-semibold text-brass">
          {label}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-semibold text-brass">{label}</span>
      );
    }
  }
}

function Attention({ value }: { value: AttentionStatus }) {
  switch (value.kind) {
    case "requires-review":
      return <Tag tone={priorityTone[value.priority]}>Requires review · {value.priority}</Tag>;
    case "follow-up-overdue":
      return <Tag tone="monitor">Follow-up overdue</Tag>;
    case "follow-up-due":
      return <span className="text-small text-ink-700">Follow-up due</span>;
    case "flagged-for-supervision":
      return <Tag tone="outline">Flagged for supervision</Tag>;
    case "none":
      return <span className="text-ink-400">—</span>;
  }
}

export function ClientTable({ clients }: { clients: CaseloadClient[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [funding, setFunding] = useState<"all" | Funding>("all");
  const [sort, setSort] = useState<Sort>("attention");

  const count = (f: ClientFilter) => clients.filter((c) => c.filters.includes(f)).length;
  const rows = clients
    .filter((c) => filter === "all" || c.filters.includes(filter))
    .filter((c) => funding === "all" || c.funding === funding)
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort(sorters[sort]);

  return (
    <Card aria-labelledby="client-list" className="col-span-12 overflow-hidden">
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-4">
        <CardTitle
          id="client-list"
          className="items-end"
          title="Clients"
          description={`${clients.length} active · ${clients.filter((c) => c.funding === "NDIS").length} NDIS · ${clients.filter((c) => c.funding === "Aged care").length} aged care`}
          aside={
            <SearchField
              label="Search Sarah’s clients"
              placeholder="Search clients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          }
        />
        <FilterChips
          label="Filter clients"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All", count: clients.length },
            { id: "requires-review", label: "Requires review", count: count("requires-review") },
            { id: "notes-overdue", label: "Notes overdue", count: count("notes-overdue") },
            { id: "follow-ups", label: "Follow-ups", count: count("follow-ups") },
            { id: "high-complexity", label: "High complexity", count: count("high-complexity") },
          ]}
        />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
          <SelectField label="Sort by" value={sort} onChange={(v) => setSort(v as Sort)}>
            <option value="attention">Attention, then next appointment</option>
            <option value="name">Client name</option>
            <option value="complexity">Complexity, highest first</option>
            <option value="tenure-asc">Time with Sarah, newest first</option>
            <option value="tenure-desc">Time with Sarah, longest first</option>
          </SelectField>
        </div>
      </div>

      <div
        className="max-h-140 overflow-auto border-t border-border"
        role="table"
        aria-label="Sarah Thompson’s clients"
      >
        <div className="min-w-280">
          <TableHeader columns={COLUMNS} className="sticky top-0 z-1">
            <div>Client</div>
            <div>Service</div>
            <div>Funding</div>
            <div>With Sarah</div>
            <div>Last session</div>
            <div>Next appointment</div>
            <div>Complexity</div>
            <div>Documentation</div>
            <div>Attention</div>
          </TableHeader>
          {rows.map((c) => (
            <TableRow key={c.id} columns={COLUMNS} className="group">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-caption text-ink-500">{c.age} yrs</div>
              </div>
              <div className="text-ink-700">{c.service}</div>
              <div>
                <Tag tone={c.funding === "NDIS" ? "live" : "neutral"}>{c.funding}</Tag>
              </div>
              <div className={c.tenureMonths < 3 ? "font-medium text-available" : "text-ink-700"}>
                {tenureLabel(c.tenureMonths)}
              </div>
              <div>{c.lastSession}</div>
              <div>
                <NextAppointment value={c.nextAppointment} />
              </div>
              <div className="flex items-center gap-1.5">
                <LevelDot level={c.complexity} />
                {c.complexity}
              </div>
              <div>
                <Documentation value={c.documentation} href={c.caseNoteHref} />
              </div>
              <div>
                <Attention value={c.attention} />
              </div>
              {c.caseNoteHref && (
                <ButtonLink
                  href={c.caseNoteHref}
                  size="sm"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-accent opacity-0 shadow-overlay transition-opacity duration-160 ease-out group-focus-within:opacity-100 group-hover:opacity-100"
                >
                  <PenNib className="text-brass" />
                  Summarise notes
                </ButtonLink>
              )}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-6 text-small text-ink-500">No clients match this filter.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2 px-5 pt-3 pb-3.5">
        <Caption>
          Attention statuses reflect configured operational indicators, not clinical risk.
        </Caption>
        <Caption>
          Showing {rows.length} of {clients.length}
        </Caption>
      </div>
    </Card>
  );
}
