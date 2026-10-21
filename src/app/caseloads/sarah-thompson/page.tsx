import type { Metadata } from "next";
import { AdminHoursChart, WorkloadChart } from "@/components/charts/workload-chart";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { MetricBand } from "@/components/ui/metric-band";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { StatusTag } from "@/components/ui/tag";
import {
  sarahClients,
  sarahMetrics,
  sarahProfile,
  sarahScoreFactors,
  sarahTrend,
  scoreThresholds,
} from "@/data/caseload";
import { ClientTable } from "@/features/caseload/client-table";
import { ScoreBreakdown } from "@/features/caseload/score-breakdown";

export const metadata: Metadata = { title: "Sarah Thompson · Caseload · Medisense" };

export default function SarahCaseloadPage() {
  const first = sarahTrend[0];
  const last = sarahTrend[sarahTrend.length - 1];

  return (
    <PageContainer>
      <PageHeader
        align="center"
        leading={
          <span
            aria-hidden="true"
            className="flex size-14 flex-none items-center justify-center rounded-full bg-chart-sand text-figure font-semibold text-ink-900"
          >
            {sarahProfile.initials}
          </span>
        }
        eyebrow="Clinician caseload"
        title={sarahProfile.name}
        description={sarahProfile.summary}
        actions={
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3 border-r border-border pr-5">
              <StatusTag status="over" />
              <span className="headline text-stat font-normal">{sarahProfile.score}</span>
            </div>
            <ButtonLink href="/team-capacity">View in Team Capacity</ButtonLink>
            <ButtonLink href="/supervision/sarah-thompson" variant="primary">
              Prepare supervision
            </ButtonLink>
          </div>
        }
      />

      <MetricBand label="Caseload metrics" metrics={[...sarahMetrics]} />

      <div className="mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <ScoreBreakdown factors={sarahScoreFactors} thresholds={scoreThresholds} />
        </div>

        <Card aria-labelledby="workload" className="col-span-12 px-6 pt-5 pb-4.5 lg:col-span-7">
          <CardTitle
            id="workload"
            title="Workload, last 6 weeks"
            description="Weighted caseload units · Low 1.0 · Medium 1.5 · High 2.5"
            aside={
              <Caption className="text-right">
                Active clients {first?.activeClients} → {last?.activeClients}
              </Caption>
            }
          />
          <div className="mt-3">
            <WorkloadChart trend={sarahTrend} capacity={sarahProfile.capacityUnits} />
          </div>
          <div className="mt-3.5 border-t border-border pt-3.5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Admin hours / week</span>
              <Caption>Three consecutive weeks above target</Caption>
            </div>
            <div className="mt-1.5">
              <AdminHoursChart trend={sarahTrend} target={sarahProfile.adminTargetHours} />
            </div>
          </div>
        </Card>

        <ClientTable clients={sarahClients} />
      </div>
    </PageContainer>
  );
}
