import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { ScheduleWorkspace } from "@/features/schedule/schedule-workspace";

export const metadata: Metadata = { title: "Schedule · Medisense" };

export default function SchedulePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Clinical"
        title="Schedule"
        description="Home visits, telehealth and driving for the whole team this week, with AI suggestions to fill gaps and shorten routes."
      />
      <ScheduleWorkspace />
    </PageContainer>
  );
}
