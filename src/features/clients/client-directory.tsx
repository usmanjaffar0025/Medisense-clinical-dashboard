"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchField } from "@/components/ui/search-field";
import { FilterBar, FilterField, Segmented, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { PriorityTag, Tag } from "@/components/ui/tag";
import {
  clientTotals,
  clientsByRegion,
  planReviewsByMonth,
  type DirectoryClient,
} from "@/data/client-directory";
import { sites } from "@/data/clinicians";
import { liveDirectory } from "@/data/records";
import type { Funding } from "@/data/types";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const COLUMNS =
  "minmax(190px,1.6fr) 96px minmax(130px,1fr) 128px minmax(180px,1.6fr) 84px 120px 96px 88px";

type StateFilter = "all" | DirectoryClient["state"] | "review-soon";

const stateTone = { Active: "healthy", Paused: "monitor", New: "available" } as const;

const fundingSeries = [
  { key: "ndis", label: "NDIS", colour: colour.series1 },
  { key: "agedCare", label: "Aged care", colour: colour.series2 },
];

export function ClientDirectory() {
  const [funding, setFunding] = useState<"all" | Funding>("all");
  const [region, setRegion] = useState("all");
  const [clinician, setClinician] = useState("all");
  const [state, setState] = useState<StateFilter>("all");
  const [query, setQuery] = useState("");
  const added = useDemoStore((x) => x.addedClients);
  const edits = useDemoStore((x) => x.clientEdits);
  const directoryClients = liveDirectory(added, edits);
  const addedIds = new Set(added.map((c) => c.id));

  const clinicianNames = [...new Set(directoryClients.map((c) => c.clinician))].sort();
  const reviewSoon = (c: DirectoryClient) => c.planReviewDays <= 30;

  const rows = directoryClients
    .filter((c) => funding === "all" || c.funding === funding)
    .filter((c) => region === "all" || c.region === region)
    .filter((c) => clinician === "all" || c.clinician === clinician)
    .filter((c) =>
      state === "all" ? true : state === "review-soon" ? reviewSoon(c) : c.state === state,
    )
    .filter((c) => `${c.name} ${c.service}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort(
      (a, b) =>
        Number(addedIds.has(b.id)) - Number(addedIds.has(a.id)) ||
        Number(b.hasProfile) - Number(a.hasProfile) ||
        a.planReviewDays - b.planReviewDays,
    );

  const reviewsNext30 = planReviewsByMonth[0];
  const metrics = [
    {
      label: "Active clients",
      value: clientTotals.all + added.length,
      caption: `${clientTotals.ndis + added.filter((c) => c.funding === "NDIS").length} NDIS · ${clientTotals.agedCare + added.filter((c) => c.funding === "Aged care").length} aged care`,
    },
    {
      label: "Brisbane North",
      value: (clientsByRegion[0]?.ndis ?? 0) + (clientsByRegion[0]?.agedCare ?? 0),
      caption: "6 clinicians",
    },
    {
      label: "Brisbane South",
      value: (clientsByRegion[1]?.ndis ?? 0) + (clientsByRegion[1]?.agedCare ?? 0),
      caption: "6 clinicians",
    },
    {
      label: "Plan reviews in November",
      value: (reviewsNext30?.ndis ?? 0) + (reviewsNext30?.agedCare ?? 0),
      caption: "Reports drafted automatically",
    },
    { label: "Requiring review", value: 14, caption: "From configured indicators", tone: "over" },
  ];

  return (
    <>
      <section
        aria-label="Client summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className={cn("headline text-stat font-normal", m.tone && "text-over")}>
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="funding-mix" className="flex flex-col px-6 pt-5 pb-5 lg:col-span-4">
          <CardTitle id="funding-mix" title="Funding mix" description="Click a slice to filter" />
          <div className="mt-5">
            <DonutChart
              label="Clients by funding"
              size={156}
              centre={
                funding === "all"
                  ? clientTotals.all
                  : funding === "NDIS"
                    ? clientTotals.ndis
                    : clientTotals.agedCare
              }
              centreCaption={funding === "all" ? "clients" : funding.toLowerCase()}
              selected={funding === "all" ? null : funding}
              onSelect={(id) => setFunding((id as Funding | null) ?? "all")}
              slices={[
                { id: "NDIS", label: "NDIS", value: clientTotals.ndis, colour: colour.series1 },
                {
                  id: "Aged care",
                  label: "Aged care",
                  value: clientTotals.agedCare,
                  colour: colour.series2,
                },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="by-region" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-3">
          <CardTitle id="by-region" title="By region" description="Home visits & telehealth" />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Clients by region and funding"
              height="fill"
              data={clientsByRegion.map((r) => ({
                ...r,
                region: r.region.replace("Brisbane ", ""),
              }))}
              xKey="region"
              series={fundingSeries}
            />
          </div>
        </Card>

        <Card aria-labelledby="plan-reviews" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="plan-reviews"
            title="Plan reviews ahead"
            description="All 184 clients · next six months"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Plan reviews by month"
              height="fill"
              data={planReviewsByMonth}
              xKey="month"
              series={fundingSeries}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <FilterBar aside={`Showing ${rows.length} of ${directoryClients.length} sample records`}>
          <FilterField label="Funding">
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
          </FilterField>
          <SelectField label="Region" value={region} onChange={setRegion}>
            <option value="all">All regions</option>
            {sites.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <SelectField label="Clinician" value={clinician} onChange={setClinician}>
            <option value="all">Everyone</option>
            {clinicianNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </SelectField>
          <SearchField
            label="Search clients"
            placeholder="Search clients or services"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Caption className="mr-0.5">Show</Caption>
          <FilterChips
            label="Filter by state"
            value={state}
            onChange={setState}
            options={[
              { id: "all" as const, label: "All clients" },
              { id: "Active" as const, label: "Active" },
              { id: "New" as const, label: "New" },
              { id: "Paused" as const, label: "Paused" },
              {
                id: "review-soon" as const,
                label: "Plan review ≤30 days",
                count: directoryClients.filter(reviewSoon).length,
              },
            ]}
          />
        </div>
      </div>

      <Card aria-label="Clients" className="overflow-hidden">
        <div className="overflow-x-auto" role="table" aria-label="Clients">
          <div className="min-w-280">
            <TableHeader columns={COLUMNS}>
              <div>Client</div>
              <div>Funding</div>
              <div>Clinician</div>
              <div>Region</div>
              <div>Service</div>
              <div>State</div>
              <div>Plan review</div>
              <div>Priority</div>
              <div className="text-right">Profile</div>
            </TableHeader>
            {rows.map((c) => (
              <TableRow key={c.id} columns={COLUMNS}>
                <div className="min-w-0 py-2">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-semibold text-ink-900 hover:text-accent"
                  >
                    {c.name}
                  </Link>
                  {c.age !== null && (
                    <span className="block text-caption text-ink-500">{c.age} yrs</span>
                  )}
                </div>
                <div className="text-ink-700">{c.funding}</div>
                <div className="text-ink-700">{c.clinician}</div>
                <div className="text-ink-700">{c.region.replace("Brisbane ", "")}</div>
                <div className="truncate text-ink-700">{c.service}</div>
                <div>
                  <Tag tone={stateTone[c.state]}>{c.state}</Tag>
                </div>
                <div className={cn(reviewSoon(c) ? "font-semibold text-over" : "text-ink-700")}>
                  {`In ${c.planReviewDays} days`}
                </div>
                <div>
                  {c.priority ? (
                    <PriorityTag priority={c.priority} />
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </div>
                <div className="text-right">
                  <Link
                    href={`/clients/${c.id}`}
                    className="inline-flex items-center gap-1 text-small font-semibold text-accent"
                  >
                    Open
                    <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <p className="px-4 py-6 text-small text-ink-500">No clients match these filters.</p>
            )}
          </div>
        </div>
        <Caption className="px-4 pt-3 pb-3.5">
          Client records stay in your practice management system; Medisense reads them to spot gaps
          and builds a full profile for each client.
        </Caption>
      </Card>
    </>
  );
}
