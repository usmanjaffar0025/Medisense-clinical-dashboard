import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { ReportsLibrary } from "@/features/reports/reports-library";

export const metadata: Metadata = { title: "Reports · Medisense" };

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="AI workspace"
        title="Reports"
        description="Every progress, plan review and assessment report across the team. AI drafts from approved records; clinicians review and approve."
      />
      <ReportsLibrary />
    </PageContainer>
  );
}
