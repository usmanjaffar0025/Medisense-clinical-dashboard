import { dt } from "@/lib/clock";
import { FilePlus, Share } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { MetricBand } from "@/components/ui/metric-band";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { TableHeader, TableRow } from "@/components/ui/table";
import { StatusTag, Tag } from "@/components/ui/tag";
import { sarahProfile, sarahTrend } from "@/data/caseload";
import { clientProfileById } from "@/data/client-profiles";
import {
  developmentGoals,
  flaggedCases,
  previousActions,
  sarahSupervision,
  upcomingSupervision,
} from "@/data/supervision";
import { WorkloadPanel } from "@/features/caseload/workload-panel";
import { SuggestedAgenda } from "@/features/supervision/agenda";
import { ProtectedTime } from "@/features/supervision/protected-time";
import { SinceBrief } from "@/features/supervision/since-brief";

export const metadata: Metadata = { title: "Sarah Thompson · Supervision · Medisense" };

const ACTION_COLUMNS = "minmax(0,1fr) 110px 110px";
const UPCOMING_COLUMNS = "minmax(0,1.2fr) minmax(0,1fr) 120px 150px";

export default function SarahSupervisionPage() {
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
              Share brief with Sarah
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

      <div className="mt-8">
        <SinceBrief />
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SuggestedAgenda />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <WorkloadPanel
            trend={sarahTrend}
            capacityUnits={sarahProfile.capacityUnits}
            adminTarget={sarahProfile.adminTargetHours}
            stretch={false}
          />
          <Card aria-labelledby="flagged-cases" className="flex-1">
            <div className="px-5 pt-4.5 pb-2.5">
              <h2 id="flagged-cases" className="headline text-h2">
                Cases flagged for discussion
              </h2>
            </div>
            {flaggedCases.map((c) => (
              <div key={c.client} className="border-t border-border px-5 py-3 last:pb-3.5">
                {clientProfileById(c.client.toLowerCase().replace(" ", "-")) ? (
                  <Link
                    href={`/clients/${c.client.toLowerCase().replace(" ", "-")}`}
                    className="font-semibold text-ink-900 hover:text-accent"
                  >
                    {c.client}
                  </Link>
                ) : (
                  <div className="font-semibold">{c.client}</div>
                )}
                <div className="text-small text-ink-700">{c.reason}</div>
              </div>
            ))}
          </Card>
        </div>

        <div className="lg:col-span-5">
          <ProtectedTime />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card id="actions" aria-labelledby="previous-actions" className="overflow-hidden">
            <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
              <h2 id="previous-actions" className="headline text-h2">
                Previous supervision actions
              </h2>
              <Caption>From {dt("Thu 24 Sep")}</Caption>
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
          <Card aria-labelledby="development-goals" className="flex-1 px-5 pt-4.5 pb-4.5">
            <div className="flex items-end justify-between gap-3">
              <h2 id="development-goals" className="headline text-h2">
                Progress against development goals
              </h2>
              <Caption>{developmentGoals.length} goals</Caption>
            </div>
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
                <div className="relative h-1.5 rounded-full bg-surface-sunken">
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

        <Card aria-labelledby="upcoming" className="overflow-hidden lg:col-span-12">
          <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
            <h2 id="upcoming" className="headline text-h2">
              Team supervision, next 14 days
            </h2>
            <Caption>All with {sarahSupervision.supervisor}</Caption>
          </div>
          <div role="table" aria-label="Upcoming supervision sessions">
            <TableHeader columns={UPCOMING_COLUMNS} className="px-5">
              <div>Clinician</div>
              <div>When</div>
              <div>Caseload</div>
              <div>Brief</div>
            </TableHeader>
            {upcomingSupervision.map((u) => (
              <TableRow
                key={u.id}
                columns={UPCOMING_COLUMNS}
                interactive={false}
                className="px-5 last:border-b-0"
              >
                <div className="font-semibold">{u.clinician}</div>
                <div className="text-ink-700">{u.when}</div>
                <div>
                  <StatusTag status={u.status} />
                </div>
                <div>
                  {u.briefReady ? (
                    <Tag tone="live">Draft ready</Tag>
                  ) : (
                    <Tag tone="neutral">Prepared 2 days before</Tag>
                  )}
                </div>
              </TableRow>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
