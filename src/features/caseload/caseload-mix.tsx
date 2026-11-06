"use client";

import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { tenureBuckets } from "@/data/caseload";
import { complexityWeights } from "@/data/clinicians";
import type { CaseloadClient, Complexity } from "@/data/types";

const weight: Record<Complexity, number> = {
  High: complexityWeights.high,
  Medium: complexityWeights.medium,
  Low: complexityWeights.low,
};

export function CaseloadMix({ clients }: { clients: CaseloadClient[] }) {
  const count = (level: Complexity) => clients.filter((c) => c.complexity === level).length;
  const units = (level: Complexity) => count(level) * weight[level];
  const totalUnits = units("High") + units("Medium") + units("Low");
  const ndis = clients.filter((c) => c.funding === "NDIS").length;

  const tenure = tenureBuckets.map((b, i) => ({
    id: b.label,
    label: b.label,
    value: clients.filter((c) => c.tenureMonths >= b.min && c.tenureMonths <= b.max).length,
    colour: i === 0 ? colour.series3 : colour.accent,
  }));

  return (
    <div className="col-span-12 grid gap-6 lg:grid-cols-3">
      <Card aria-labelledby="complexity-mix" className="flex flex-col px-6 pt-5 pb-5">
        <CardTitle
          id="complexity-mix"
          title="Complexity mix"
          description="Clients and weighted units by complexity"
        />
        <div className="mt-4 mb-4">
          <DonutChart
            label="Clients by complexity"
            centre={totalUnits.toFixed(1)}
            centreCaption="weighted units"
            size={150}
            format={(v) => String(v)}
            slices={[
              {
                id: "High",
                label: `High · ${units("High").toFixed(1)}u`,
                value: count("High"),
                colour: colour.over,
              },
              {
                id: "Medium",
                label: `Medium · ${units("Medium").toFixed(1)}u`,
                value: count("Medium"),
                colour: colour.sand,
              },
              {
                id: "Low",
                label: `Low · ${units("Low").toFixed(1)}u`,
                value: count("Low"),
                colour: colour.sage,
              },
            ]}
          />
        </div>
        <Caption className="mt-auto border-t border-border pt-3">
          {count("High")} high-complexity clients carry{" "}
          {Math.round((units("High") / totalUnits) * 100)}% of the weighted load.
        </Caption>
      </Card>

      <Card aria-labelledby="funding-mix" className="flex flex-col px-6 pt-5 pb-5">
        <CardTitle
          id="funding-mix"
          title="Funding streams"
          description="Active clients by funder"
        />
        <div className="mt-4 mb-4">
          <DonutChart
            label="Clients by funding stream"
            centre={clients.length}
            centreCaption="active clients"
            size={150}
            slices={[
              { id: "ndis", label: "NDIS", value: ndis, colour: colour.series1 },
              {
                id: "aged",
                label: "Aged care",
                value: clients.length - ndis,
                colour: colour.series2,
              },
            ]}
          />
        </div>
        <Caption className="mt-auto border-t border-border pt-3">
          Aged care clients are home modifications, falls prevention and equipment.
        </Caption>
      </Card>

      <Card aria-labelledby="continuity" className="flex flex-col px-6 pt-5 pb-5">
        <CardTitle
          id="continuity"
          title="Continuity of care"
          description="How long each client has been with Sarah"
        />
        <div className="mt-3 mb-4">
          <BarList
            label="Clients by time with clinician"
            data={tenure}
            labelWidth={112}
            unit="clients"
          />
        </div>
        <Caption className="mt-auto border-t border-border pt-3">
          Newer clients are the least disruptive to review if work is rebalanced.
        </Caption>
      </Card>
    </div>
  );
}
