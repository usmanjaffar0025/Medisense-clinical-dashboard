import { projectedImpact } from "@/data/organisation";
import { BlueOverview } from "@/features/overview/clear-blue/blue-overview";
import { ImpactBand } from "@/features/overview/impact-band";
import { OverviewDashboard } from "@/features/overview/overview-dashboard";

export default function OverviewPage() {
  return (
    <BlueOverview>
      <OverviewDashboard />
      <ImpactBand measures={projectedImpact} />
    </BlueOverview>
  );
}
