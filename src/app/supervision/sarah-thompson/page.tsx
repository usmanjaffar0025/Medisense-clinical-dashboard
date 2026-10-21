import { ArrowRight, FilePlus, Share } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminHoursChart, WorkloadChart } from "@/components/charts/workload-chart";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { MetricBand } from "@/components/ui/metric-band";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { sarahProfile, sarahTrend } from "@/data/caseload";
import {
  developmentGoals,
  flaggedCases,
  previousActions,
  sarahSupervision,
} from "@/data/supervision";
import { SuggestedAgenda } from "@/features/supervision/agenda";

export const metadata: Metadata = { title: "Sarah Thompson · Supervision · Medisense" };

const ACTION_COLUMNS = "minmax(0,1fr) 110px 110px";

export default function SarahSupervisionPage() {
  const first = sarahTrend[0];
  const last = sarahTrend[sarahTrend.length - 1];
  const growth =
    first && last
      ? Math.round(((last.weightedUnits - first.weightedUnits) / first.weightedUnits) * 100)
      : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={sarahSupervision.eyebrow}
        title={sarahSupervision.clinician}
        description={sarahSupervision.session}
        actions={
          <>
            <Button>
              <Share className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Share agenda with Sarah
            </Button>
            <Button variant="primary">
              <FilePlus className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Start session notes
            </Button>
          </>
        }
      />

      <MetricBand
        label="Supervision facts"
        size="stat-sm"
        metrics={sarahSupervision.facts.map((f) => ({
          label: f.label,
          value: f.suffix ? (
            <>
              {f.value} <span className="text-figure text-ink-500">{f.suffix}</span>
            </>
          ) : (
            f.value
          ),
        }))}
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SuggestedAgenda />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card id="workload" aria-labelledby="workload-trend" className="px-5 pt-5 pb-4">
            <CardTitle
              id="workload-trend"
              title="Workload trend"
              description="Weighted units, 14 Sep – 19 Oct"
              aside={<span className="headline text-stat-sm text-over">+{growth}%</span>}
            />
            <div className="mt-2.5">
              <WorkloadChart
                trend={sarahTrend}
                capacity={sarahProfile.capacityUnits}
                variant="compact"
              />
            </div>
            <div className="mt-3 eyebrow">
              Admin hours / week · {sarahProfile.adminTargetHours}h target
            </div>
            <div className="mt-1">
              <AdminHoursChart
                trend={sarahTrend}
                target={sarahProfile.adminTargetHours}
                variant="compact"
              />
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <Link
                href="/team-capacity"
                className="inline-flex items-center gap-1.5 text-small font-semibold"
              >
                View in Team capacity
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </Card>

          <Card aria-labelledby="flagged-cases">
            <div className="px-5 pt-4.5 pb-2.5">
              <h2 id="flagged-cases" className="headline text-h2">
                Cases flagged for discussion
              </h2>
            </div>
            {flaggedCases.map((c) => (
              <div key={c.client} className="border-t border-border px-5 py-3 last:pb-3.5">
                <div className="font-semibold">{c.client}</div>
                <div className="text-small text-ink-700">{c.reason}</div>
              </div>
            ))}
          </Card>
        </div>

        <Card
          id="actions"
          aria-labelledby="previous-actions"
          className="overflow-hidden lg:col-span-7"
        >
          <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
            <h2 id="previous-actions" className="headline text-h2">
              Previous supervision actions
            </h2>
            <Caption>From Thu 24 Sep</Caption>
          </div>
          <div role="table" aria-label="Previous supervision actions">
            <TableHeader columns={ACTION_COLUMNS} className="px-5">
              <div>Action</div>
              <div>Owner</div>
              <div>Status</div>
            </TableHeader>
            {previousActions.map((a) => (
              <TableRow
                key={a.action}
                columns={ACTION_COLUMNS}
                interactive={false}
                className="px-5 last:border-b-0"
              >
                <div>{a.action}</div>
                <div className="text-ink-700">{a.owner}</div>
                <div>
                  <Tag tone={a.open ? "monitor" : "healthy"}>{a.open ? "Open" : "Completed"}</Tag>
                </div>
              </TableRow>
            ))}
          </div>
        </Card>

        <Card aria-labelledby="development-goals" className="px-5 pt-4.5 pb-4.5 lg:col-span-5">
          <h2 id="development-goals" className="headline text-h2">
            Pending development goals
          </h2>
          {developmentGoals.map((g, index) => (
            <div
              key={g.goal}
              className={`${index === 0 ? "mt-3.5" : "mt-4"} flex flex-col gap-2 border-t border-border pt-3.5`}
            >
              <div className="flex justify-between gap-3">
                <span className="font-semibold">{g.goal}</span>
                <span className={`text-small ${g.progress === 0 ? "text-ink-500" : ""}`}>
                  {g.status}
                </span>
              </div>
              <div className="relative h-1 rounded-full bg-surface-sunken">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
              <Caption>{g.due}</Caption>
            </div>
          ))}
        </Card>
      </div>
    </PageContainer>
  );
}
