import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { SecuritySettings } from "@/features/settings/security-settings";

export const metadata: Metadata = { title: "Security & integrations · Medisense" };

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Platform"
        title="Security & integrations"
        description="Who can see what, how AI is allowed to work with client data, and how Medisense connects to the systems you already use."
      />
      <SecuritySettings />
    </PageContainer>
  );
}
