import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { PortalPreview } from "@/features/portal/portal-preview";

export const metadata: Metadata = { title: "Family portal · Medisense" };

export default function PortalPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Platform · preview"
        title="Family portal"
        description="What Emily Carter's parent sees: visits, practice at home, goals in plain language, approved reports and messages."
        actions={<ButtonLink href="/family">Open family sign-in</ButtonLink>}
      />
      <PortalPreview />
    </PageContainer>
  );
}
