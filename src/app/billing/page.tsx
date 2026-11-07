import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { Billing } from "@/features/billing/billing";

export const metadata: Metadata = { title: "Billing and claims · Medisense" };

export default function BillingPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Business"
        title="Billing and claims"
        description="Claims built from completed sessions. A person approves every batch."
      />
      <Billing />
    </PageContainer>
  );
}
