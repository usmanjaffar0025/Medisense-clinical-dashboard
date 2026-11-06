import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { AutomationsWorkspace } from "@/features/automations/automations-workspace";

export const metadata: Metadata = { title: "Automations · Medisense" };

export default function AutomationsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Intake & admin"
        title="Automations"
        description="Rules that prepare the next step when something happens: reminders, drafts, tasks and escalations. People approve; every run is logged."
      />
      <AutomationsWorkspace />
    </PageContainer>
  );
}
