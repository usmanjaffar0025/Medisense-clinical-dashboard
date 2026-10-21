"use client";

import Link from "next/link";
import { useState } from "react";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { CapacityMeter } from "@/components/ui/capacity-meter";
import { Complexity } from "@/components/ui/dot";
import { FilterChips } from "@/components/ui/filter-chips";
import { TableHeader, TableRow } from "@/components/ui/table";
import { StatusTag, Tag } from "@/components/ui/tag";
import { clinicians, formatFte, statusCounts } from "@/data/clinicians";
import type { CaseloadStatus } from "@/data/types";
import { cn } from "@/lib/cn";

type Filter = "all" | CaseloadStatus;

const COLUMNS = "minmax(0,1.4fr) minmax(100px,1fr) 80px 48px 80px 86px 44px 104px";

const DETAIL_HREF: Record<string, string> = {
  "sarah-thompson": "/caseloads/sarah-thompson",
};

export function CaseloadHealth() {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = [...clinicians]
    .sort((a, b) => b.score - a.score)
    .filter((c) => filter === "all" || c.status === filter);

  return (
    <Card aria-labelledby="caseload-health" className="overflow-hidden">
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-4">
        <CardTitle
          id="caseload-health"
          title="Caseload health"
          description={
            <span className="block max-w-140 text-small font-normal text-ink-700">
              Scored from configured operational indicators: capacity, complexity, documentation,
              follow-ups, supervision and admin load.
            </span>
          }
          aside={<Caption className="pt-1.5">Sorted by score</Caption>}
        />
        <FilterChips
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          countStyle="brackets"
          options={[
            { id: "all", label: "All", count: statusCounts.all },
            { id: "over", label: "Over Capacity", count: statusCounts.over },
            { id: "monitor", label: "Monitor", count: statusCounts.monitor },
            { id: "healthy", label: "Healthy", count: statusCounts.healthy },
          ]}
        />
      </div>

      <div className="overflow-x-auto" role="table" aria-label="Caseload health by clinician">
        <div className="min-w-190">
          <TableHeader columns={COLUMNS} className="px-3">
            <div>Clinician</div>
            <div>Capacity</div>
            <div>Complexity</div>
            <div className="text-right" title="Notes overdue">
              Notes
            </div>
            <div className="text-right">Follow-ups</div>
            <div>Supervision</div>
            <div className="text-right">Score</div>
            <div>Status</div>
          </TableHeader>
          {rows.map((c) => {
            const href = DETAIL_HREF[c.id];
            const over = c.utilisation > 100;
            return (
              <TableRow
                key={c.id}
                columns={COLUMNS}
                className={cn("px-3", c.status === "over" && "shadow-rule-over")}
              >
                <div className="min-w-0">
                  {href ? (
                    <Link
                      href={href}
                      className="block truncate font-semibold text-ink-900 hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    <div className="truncate font-semibold">{c.name}</div>
                  )}
                  <div className="truncate text-caption text-ink-500">
                    {c.role} · {formatFte(c.fte)}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pr-1.5">
                  <div className="flex justify-between gap-1.5">
                    <span>
                      {c.active} / {c.capacity}
                    </span>
                    <span className={over ? "font-semibold text-over" : "font-medium text-ink-700"}>
                      {c.utilisation}%
                    </span>
                  </div>
                  <CapacityMeter utilisation={c.utilisation} />
                </div>
                <Complexity level={c.complexity} note={`${c.highComplexity} high`} />
                <div className="text-right">{c.notesOverdue}</div>
                <div className="text-right">{c.followUpsOverdue}</div>
                <div>
                  <div>{c.nextSupervision}</div>
                  <div className="text-caption text-ink-500">{c.supervisionNote}</div>
                </div>
                <div className="text-right font-serif text-figure">{c.score}</div>
                <div className="flex flex-wrap gap-1">
                  <StatusTag status={c.status} />
                  {c.available && <Tag tone="available">Available</Tag>}
                </div>
              </TableRow>
            );
          })}
        </div>
      </div>
      <Caption className="px-5 pt-3 pb-3.5">
        Score reflects configured operational indicators only. It is not a clinical assessment.
      </Caption>
    </Card>
  );
}
