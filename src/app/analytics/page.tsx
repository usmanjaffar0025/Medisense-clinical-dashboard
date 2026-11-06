import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";

export const metadata: Metadata = { title: "Analytics · Medisense" };

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Organisation"
        title="Analytics"
        description="Sessions, outcomes, documentation and access trends across the team. Filter by region, discipline and period."
      />
      <AnalyticsDashboard />
    </PageContainer>
  );
}
