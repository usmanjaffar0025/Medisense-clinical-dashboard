import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { sarahClients, sarahProfile, sarahTrend } from "@/data/caseload";
import { CaseloadMix } from "@/features/caseload/caseload-mix";
import { ClientTable } from "@/features/caseload/client-table";
import { LiveMetrics, LiveScoreBreakdown, LiveScoreTag } from "@/features/caseload/live-caseload";
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
            <LiveScoreTag />
            <ButtonLink href="/team-capacity">View in Team Capacity</ButtonLink>
            <ButtonLink href="/supervision/sarah-thompson" variant="primary">
              Prepare supervision
            </ButtonLink>
          </div>
        }
      />

      <LiveMetrics />

      <div className="mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <LiveScoreBreakdown />
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
