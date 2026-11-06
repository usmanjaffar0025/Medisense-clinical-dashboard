import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { FormsWorkspace } from "@/features/forms/forms-workspace";

export const metadata: Metadata = { title: "Smart forms · Medisense" };

export default function FormsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Intake & admin"
        title="Smart forms"
        description="Funding requests, agreements and consents filled from verified client data, approved notes and referrals. Staff complete the gaps; nothing is submitted until every required field is checked."
      />
      <Suspense fallback={<p className="text-small text-ink-500">Loading forms…</p>}>
        <FormsWorkspace />
      </Suspense>
    </PageContainer>
  );
}
