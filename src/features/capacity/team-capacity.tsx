"use client";

import { useState } from "react";
import { BarList, type BarDatum } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { CapacityMeter } from "@/components/ui/capacity-meter";
import { LevelDot } from "@/components/ui/dot";
import { PageHeader } from "@/components/ui/page";
import { FilterBar, FilterField, Segmented } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { StatusTag, Tag } from "@/components/ui/tag";
import { tenureLabel } from "@/data/caseload";
import { rebalanceScenario, transferCandidates } from "@/data/capacity";
import {
  capacityTableOrder,
  clinicians,
  formatFte,
  formatUnits,
  disciplines,
  inScope,
  sites,
  statusCounts,
} from "@/data/clinicians";
import type { Clinician, Discipline, Site } from "@/data/types";
import { cn } from "@/lib/cn";
import { Recommendation } from "./recommendation";

const COLUMNS = "minmax(150px,1.5fr) 56px 64px 92px minmax(130px,1.2fr) 104px 96px 56px 64px 124px";
const CANDIDATE_COLUMNS = "minmax(140px,1.2fr) minmax(170px,1.6fr) 96px 92px 110px";

/** Filled, open and over-capacity places, counted per clinician so one clinician's overflow is not hidden by another's spare places. */
function places(list: Clinician[]) {
  return {
    clinicians: list.length,
    fte: list.reduce((sum, c) => sum + c.fte, 0),
    active: list.reduce((sum, c) => sum + Math.min(c.active, c.capacity), 0),
    free: list.reduce((sum, c) => sum + Math.max(c.capacity - c.active, 0), 0),
    over: list.reduce((sum, c) => sum + Math.max(c.active - c.capacity, 0), 0),
    utilisation: Math.round(
      (list.reduce((sum, c) => sum + c.active, 0) /
        Math.max(
          list.reduce((sum, c) => sum + c.capacity, 0),
          1,
        )) *
        100,
    ),
  };
}

function barColour(c: Clinician) {
  if (c.utilisation > 100) return colour.over;
  if (c.available) return colour.series3;
  return colour.accent;
}

export function TeamCapacity() {
  const [site, setSite] = useState<"all" | Site>("all");
  const [discipline, setDiscipline] = useState<"all" | Discipline>("all");
  const [previewing, setPreviewing] = useState(false);
  const visible = clinicians.filter((c) => inScope(c, { site, discipline }));
  const ordered = capacityTableOrder
    .map((id) => visible.find((c) => c.id === id))
    .filter((c): c is Clinician => c !== undefined);

  const active = visible.reduce((sum, c) => sum + c.active, 0);
  const capacity = visible.reduce((sum, c) => sum + c.capacity, 0);
  const counts = statusCounts(visible);

  const scenarioFor = (c: Clinician) =>
    c.id === "sarah-thompson"
      ? rebalanceScenario.sarah
      : c.id === "emma-clarke"
        ? rebalanceScenario.emma
        : null;

  const utilisation: BarDatum[] = [...visible]
    .sort((a, b) => b.utilisation - a.utilisation)
    .map((c) => {
      const scenario = previewing ? scenarioFor(c) : null;
      return {
        id: c.id,
        label: c.name,
        value: scenario ? scenario.after.utilisation : c.utilisation,
        ghost: previewing ? (scenario ? c.utilisation : undefined) : undefined,
        colour: scenario ? colour.series2 : barColour(c),
        detail: `${scenario ? scenario.after.active : c.active} of ${c.capacity} clients · ${c.discipline} · ${c.site}`,
      };
    });

  const freeUnits: BarDatum[] = [...visible]
    .map((c) => {
      const scenario = previewing ? scenarioFor(c) : null;
      const units = scenario ? scenario.after.units : c.weightedUnits;
      const free = Math.round((c.weightedCapacity - units) * 10) / 10;
      return {
        id: c.id,
        label: c.name,
        value: free,
        colour: free < 0 ? colour.over : c.available ? colour.series3 : colour.sage,
        detail: `${formatUnits(units)} of ${formatUnits(c.weightedCapacity)} weighted units`,
      };
    })
    .sort((a, b) => a.value - b.value);

  const breakdown = [
    ...sites.map((x) => ({ group: x, list: visible.filter((c) => c.site === x) })),
    ...disciplines.map((d) => ({
      group: d === "Occupational Therapy" ? "OT" : "Speech Path.",
      list: visible.filter((c) => c.discipline === d),
    })),
  ]
    .filter((g) => g.list.length > 0)
    .map(({ group, list }) => ({ group, ...places(list) }));

  return (
    <>
      <PageHeader
        eyebrow={`Organisation · ${active} of ${capacity} places · ${capacity ? Math.round((active / capacity) * 100) : 0}%`}
        title="Team capacity"
        description="Utilisation against configured capacity, weighted by client complexity. Continuity of care is part of every recommendation."
      />

      <FilterBar
        aside={`${visible.length} clinicians · ${counts["at-risk"]} At Risk · ${counts.monitor} Monitor · ${counts.healthy} Healthy`}
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
        {previewing && <Tag tone="monitor">Scenario preview · not applied</Tag>}
      </FilterBar>

      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="utilisation" className="px-6 pt-5 pb-4.5 lg:col-span-8">
          <CardTitle
            id="utilisation"
            className="mb-3 items-end"
            title="Utilisation by clinician"
            description="Active clients as a share of configured capacity · dashed line at 100%"
            aside={
              <ul className="flex flex-wrap gap-4 text-caption font-medium text-ink-500">
                <Legend fill={colour.accent} label="Within capacity" />
                <Legend fill={colour.over} label="Above capacity" />
                <Legend fill={colour.series3} label="Available" />
                {previewing && <Legend fill={colour.series2} label="Scenario" />}
              </ul>
            }
          />
          <BarList
            label="Utilisation by clinician"
            data={utilisation}
            domain={[0, 120]}
            format={(v) => `${v}%`}
            unit="of capacity"
            labelWidth={124}
            references={[{ x: 100, label: "100%" }]}
          />
        </Card>

        <div className="lg:col-span-4 lg:self-stretch">
          <Recommendation
            previewing={previewing}
            onTogglePreview={() => setPreviewing(!previewing)}
          />
        </div>

        <Card aria-labelledby="free-units" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle
            id="free-units"
            title="Free capacity, complexity-weighted"
            description="Weighted capacity minus weighted caseload · below zero is over capacity"
          />
          <div className="mt-3">
            <BarList
              label="Free weighted capacity by clinician"
              data={freeUnits}
              domain={[-6, 8]}
              format={(v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
              unit="units free"
              labelWidth={124}
              references={[{ x: 0, label: "0" }]}
            />
          </div>
          <Caption className="mt-auto border-t border-border pt-3">
            Emma has 6 open places but ≈6.5 free units, enough for about four medium-complexity
            clients. That is why the suggestion says four, not six.
          </Caption>
        </Card>

        <Card aria-labelledby="by-site" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="by-site"
            title="Places by site and discipline"
            description="Filled, open and over-capacity places, counted per clinician"
          />
          <div className="mt-3">
            <StackedColumns
              label="Places by site and discipline"
              layout="vertical"
              height={breakdown.length * 40 + 30}
              labelWidth={84}
              data={breakdown}
              xKey="group"
              series={[
                { key: "active", label: "Filled", colour: colour.series1 },
                { key: "free", label: "Open", colour: colour.series4 },
                { key: "over", label: "Over capacity", colour: colour.over },
              ]}
            />
          </div>
          <div
            className="mt-auto border-t border-border pt-3"
            role="table"
            aria-label="Site and discipline summary"
          >
            <div
              role="row"
              className="grid grid-cols-[minmax(0,1fr)_64px_56px_56px_72px] gap-2 pb-1.5 eyebrow"
            >
              <span>Group</span>
              <span className="text-right">Clinicians</span>
              <span className="text-right">FTE</span>
              <span className="text-right">Open</span>
              <span className="text-right">Utilisation</span>
            </div>
            {breakdown.map((g) => (
              <div
                key={g.group}
                role="row"
                className="grid grid-cols-[minmax(0,1fr)_64px_56px_56px_72px] gap-2 border-t border-border py-1.5 text-small"
              >
                <span className="font-semibold">{g.group}</span>
                <span className="text-right">{g.clinicians}</span>
                <span className="text-right">{g.fte.toFixed(1)}</span>
                <span className="text-right">{g.free}</span>
                <span
                  className={cn(
                    "text-right",
                    g.utilisation >= 95 ? "font-semibold text-over" : "text-ink-700",
                  )}
                >
                  {g.utilisation}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card aria-labelledby="caseload-balance" className="overflow-hidden lg:col-span-12">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
            <h2 id="caseload-balance" className="headline text-h2">
              Caseload balance
            </h2>
            <Caption>
              Totals {active} / {capacity} · {counts["at-risk"]} At Risk · {counts.monitor} Monitor
              · {counts.healthy} Healthy
            </Caption>
          </div>
          <div className="overflow-x-auto" role="table" aria-label="Caseload balance by clinician">
            <div className="min-w-260">
              <TableHeader columns={COLUMNS}>
                <div>Clinician</div>
                <div className="text-right">Active</div>
                <div className="text-right">Capacity</div>
                <div>Complexity</div>
                <div>Utilisation</div>
                <div className="text-right">Weighted units</div>
                <div>Funding</div>
                <div className="text-right">Notes</div>
                <div className="text-right">Follow-ups</div>
                <div>Status</div>
              </TableHeader>
              {ordered.map((c) => (
                <TableRow
                  key={c.id}
                  columns={COLUMNS}
                  className={cn(c.status === "at-risk" && "shadow-rule-over")}
                >
                  <div className="min-w-0">
                    <div className="font-semibold">{c.name}</div>
                    <div className="truncate text-caption font-medium text-ink-500">
                      {c.role} · {formatFte(c.fte)} · {c.site}
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
                  <div
                    className={cn(
                      "text-right",
                      c.weightedUnits > c.weightedCapacity
                        ? "font-semibold text-over"
                        : "text-ink-700",
                    )}
                  >
                    {formatUnits(c.weightedUnits)} / {formatUnits(c.weightedCapacity)}
                  </div>
                  <div className="text-caption text-ink-700">
                    {c.funding.ndis} NDIS · {c.funding.agedCare} AC
                  </div>
                  <div className="text-right">{c.notesDue}</div>
                  <div className="text-right">{c.followUpsOverdue}</div>
                  <div className="flex flex-wrap gap-1">
                    <StatusTag status={c.status} />
                    {c.available && <Tag tone="available">Available</Tag>}
                  </div>
                </TableRow>
              ))}
              {ordered.length === 0 && (
                <p className="px-5 py-6 text-small text-ink-500">
                  No clinicians match these filters.
                </p>
              )}
            </div>
          </div>
          <Caption className="px-5 pt-3 pb-3.5">
            Weighted units: Low 1.0 · Medium 1.5 · High 2.5. Configured capacity assumes a
            medium-complexity caseload (capacity × 1.5).
          </Caption>
        </Card>

        <Card aria-labelledby="candidates" className="overflow-hidden lg:col-span-12">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
            <div>
              <h2 id="candidates" className="headline text-h2">
                Clients a supervisor could review for transfer
              </h2>
              <Caption className="mt-1">
                Sarah’s clients seen for under 3 months, not high complexity, with no open flags.
                Established relationships stay with Sarah.
              </Caption>
            </div>
            <Tag tone="outline">For review · nothing is reassigned</Tag>
          </div>
          <div role="table" aria-label="Transfer candidates">
            <TableHeader columns={CANDIDATE_COLUMNS} className="px-5">
              <div>Client</div>
              <div>Service</div>
              <div>Complexity</div>
              <div>With Sarah</div>
              <div>Funding</div>
            </TableHeader>
            {transferCandidates.map((c) => (
              <TableRow
                key={c.id}
                columns={CANDIDATE_COLUMNS}
                interactive={false}
                className="px-5 last:border-b-0"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-caption text-ink-500">{c.age} yrs</div>
                </div>
                <div className="text-ink-700">{c.service}</div>
                <div className="flex items-center gap-1.5">
                  <LevelDot level={c.complexity} />
                  {c.complexity}
                </div>
                <div className="font-medium text-available">{tenureLabel(c.tenureMonths)}</div>
                <div>
                  <Tag tone={c.funding === "NDIS" ? "live" : "neutral"}>{c.funding}</Tag>
                </div>
              </TableRow>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Legend({ fill, label }: { fill: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-xs" style={{ backgroundColor: fill }} />
      {label}
    </li>
  );
}
