import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { IntakeWorkspace } from "@/features/intake/intake-workspace";

export const metadata: Metadata = { title: "Referrals & intake · Medisense" };

export default function IntakePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Intake & admin"
        title="Referrals & intake"
        description="Referrals arrive by email, web form and letter. AI reads each one, extracts the client details, flags gaps and duplicates, and a person verifies before a profile is created."
      />
      <IntakeWorkspace />
    </PageContainer>
  );
}
