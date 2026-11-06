import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { MetricBand } from "@/components/ui/metric-band";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { StatusTag } from "@/components/ui/tag";
import {
  sarahClients,
  sarahMetrics,
  sarahProfile,
  sarahScoreFactors,
  sarahTrend,
} from "@/data/caseload";
import { sarah, scoreThresholds } from "@/data/clinicians";
import { CaseloadMix } from "@/features/caseload/caseload-mix";
import { ClientTable } from "@/features/caseload/client-table";
import { ScoreBreakdown } from "@/features/caseload/score-breakdown";
import { WorkloadPanel } from "@/features/caseload/workload-panel";

export const metadata: Metadata = { title: "Sarah Thompson · Caseload · Medisense" };

export default function SarahCaseloadPage() {
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
              <StatusTag status={sarah.status} />
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
        <div className="col-span-12 lg:col-span-7">
          <WorkloadPanel
            trend={sarahTrend}
            capacityUnits={sarahProfile.capacityUnits}
            adminTarget={sarahProfile.adminTargetHours}
          />
        </div>

        <CaseloadMix clients={sarahClients} />

        <ClientTable clients={sarahClients} />
      </div>
    </PageContainer>
  );
}
