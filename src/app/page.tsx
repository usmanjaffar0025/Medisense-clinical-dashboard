import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { currentUser, organisation, organisationKpis, pilotImpact } from "@/data/organisation";
import { AttentionPanel } from "@/features/overview/attention-panel";
import { CaseloadHealth } from "@/features/overview/caseload-health";
import { ImpactBand } from "@/features/overview/impact-band";
import { KpiGrid } from "@/features/overview/kpi-grid";

export default function OverviewPage() {
  return (
    <PageContainer>
      <PageHeader
        display
        eyebrow={organisation.today}
        title={`Good morning, ${currentUser.firstName}.`}
        description={`${organisation.name} · 10 clinicians · ${organisation.activeClients} active clients. One clinician is above configured capacity.`}
        actions={
          <>
            <Button>
              <FileText className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Weekly summary
            </Button>
            <Button variant="ghost">
              <Download className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Export
            </Button>
          </>
        }
      />

      <KpiGrid kpis={organisationKpis} label="Organisation indicators" />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
        <CaseloadHealth />
        <AttentionPanel />
      </div>

      <ImpactBand measures={pilotImpact} />
    </PageContainer>
  );
}
