import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { clinicians } from "@/data/clinicians";
import { currentUser, organisation, projectedImpact } from "@/data/organisation";
import { ImpactBand } from "@/features/overview/impact-band";
import { OverviewDashboard } from "@/features/overview/overview-dashboard";

export default function OverviewPage() {
  const activeClients = clinicians.reduce((sum, c) => sum + c.active, 0);
  const atRisk = clinicians.filter((c) => c.status === "at-risk").length;

  return (
    <PageContainer>
      <PageHeader
        display
        eyebrow={organisation.today}
        title={`Good morning, ${currentUser.firstName}.`}
        description={`${organisation.name} · ${clinicians.length} clinicians · ${activeClients} active clients. ${atRisk === 1 ? "One clinician is" : `${atRisk} clinicians are`} above configured capacity.`}
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

      <OverviewDashboard />
      <ImpactBand measures={projectedImpact} />
    </PageContainer>
  );
}
