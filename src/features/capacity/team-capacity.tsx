"use client";

import { useState } from "react";
import { UtilisationBars } from "@/components/charts/utilisation-bars";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { CapacityMeter } from "@/components/ui/capacity-meter";
import { LevelDot } from "@/components/ui/dot";
import { PageHeader } from "@/components/ui/page";
import { TableHeader, TableRow } from "@/components/ui/table";
import { StatusTag, Tag } from "@/components/ui/tag";
import { capacityTableOrder, clinicians, formatFte } from "@/data/clinicians";
import type { Clinician } from "@/data/types";
import { cn } from "@/lib/cn";
import { Recommendation } from "./recommendation";

type Site = "all" | Clinician["site"];

const sites: { id: Site; label: string }[] = [
  { id: "all", label: "All sites" },
  { id: "Richmond", label: "Richmond" },
  { id: "Box Hill", label: "Box Hill" },
];

const COLUMNS = "minmax(150px,1.5fr) 64px 72px 92px minmax(130px,1.2fr) 112px 132px";

function summarise(list: Clinician[]) {
  const active = list.reduce((sum, c) => sum + c.active, 0);
  const capacity = list.reduce((sum, c) => sum + c.capacity, 0);
  const count = (status: Clinician["status"]) => list.filter((c) => c.status === status).length;
  return {
    active,
    capacity,
    utilisation: Math.round((active / capacity) * 100),
    line: `Totals ${active} / ${capacity} · ${count("over")} Over Capacity · ${count("monitor")} Monitor · ${count("healthy")} Healthy`,
  };
}

function roleLine(c: Clinician) {
  if (c.fte !== 1) return `${c.role} · ${formatFte(c.fte)}`;
  return c.status === "over" ? `${c.role} · ${c.site}` : c.role;
}

export function TeamCapacity() {
  const [site, setSite] = useState<Site>("all");
  const visible = clinicians.filter((c) => site === "all" || c.site === site);
  const ordered = capacityTableOrder
    .map((id) => visible.find((c) => c.id === id))
    .filter((c): c is Clinician => c !== undefined);
  const totals = summarise(visible);

  return (
    <>
      <PageHeader
        eyebrow={`Organisation · ${totals.active} of ${totals.capacity} places · ${totals.utilisation}%`}
        title="Team capacity"
        description="Utilisation against configured capacity, weighted by client complexity."
        actions={
          <div
            role="group"
            aria-label="Site"
            className="flex gap-0.5 rounded-control border border-border bg-surface-sunken p-0.5"
          >
            {sites.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={site === s.id}
                onClick={() => setSite(s.id)}
                className={cn(
                  "h-7.5 cursor-pointer rounded-tag px-3 text-small",
                  site === s.id
                    ? "bg-surface-raised font-semibold text-ink-900 shadow-hairline"
                    : "font-medium text-ink-700 hover:text-ink-900",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="utilisation" className="px-6 pt-5 pb-4.5 lg:col-span-8">
          <CardTitle
            id="utilisation"
            className="mb-4 items-end"
            title="Utilisation by clinician"
            description="Active clients as a share of configured capacity · dashed line at 100%"
            aside={
              <div className="flex flex-wrap gap-4 text-caption font-medium text-ink-500">
                <Legend className="bg-accent" label="Within capacity" />
                <Legend className="bg-over-dot" label="Above capacity" />
                <Legend className="bg-chart-slate" label="Available" />
              </div>
            }
          />
          <UtilisationBars clinicians={visible} />
        </Card>

        <div className="lg:col-span-4 lg:self-stretch">
          <Recommendation />
        </div>
        <Card aria-labelledby="caseload-balance" className="overflow-hidden lg:col-span-12">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
            <h2 id="caseload-balance" className="headline text-h2">
              Caseload balance
            </h2>
            <Caption>{totals.line}</Caption>
          </div>
          <div className="overflow-x-auto" role="table" aria-label="Caseload balance by clinician">
            <div className="min-w-190">
              <TableHeader columns={COLUMNS}>
                <div>Clinician</div>
                <div className="text-right">Active</div>
                <div className="text-right">Capacity</div>
                <div>Complexity</div>
                <div>Utilisation</div>
                <div className="text-right">Weighted units</div>
                <div>Status</div>
              </TableHeader>
              {ordered.map((c) => (
                <TableRow
                  key={c.id}
                  columns={COLUMNS}
                  className={cn(c.status === "over" && "shadow-rule-over")}
                >
                  <div className="min-w-0">
                    <div className="font-semibold">{c.name}</div>
                    <div className="truncate text-caption font-medium text-ink-500">
                      {roleLine(c)}
                    </div>
                  </div>
                  <div className="text-right">{c.active}</div>
                  <div className="text-right">{c.capacity}</div>
                  <div className="flex items-center gap-1.5">
                    <LevelDot level={c.complexity} />
                    {c.complexity}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CapacityMeter
                      utilisation={c.utilisation}
                      available={c.available}
                      className="flex-1"
                    />
                    <span
                      className={cn(
                        "w-9.5 text-right",
                        c.utilisation > 100
                          ? "font-semibold text-over"
                          : "font-medium text-ink-700",
                      )}
                    >
                      {c.utilisation}%
                    </span>
                  </div>
                  <div className={cn("text-right", c.weightedUnits ? "text-over" : "text-ink-400")}>
                    {c.weightedUnits && c.weightedCapacity
                      ? `${c.weightedUnits.toFixed(1)} / ${c.weightedCapacity}`
                      : "—"}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <StatusTag status={c.status} />
                    {c.available && <Tag tone="available">Available</Tag>}
                  </div>
                </TableRow>
              ))}
            </div>
          </div>
          <Caption className="px-5 pt-3 pb-3.5">
            Weighted units: Low 1.0 · Medium 1.5 · High 2.5. Shown where calculated in this demo
            dataset.
          </Caption>
        </Card>
      </div>
    </>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-xs", className)} />
      {label}
    </span>
  );
}
