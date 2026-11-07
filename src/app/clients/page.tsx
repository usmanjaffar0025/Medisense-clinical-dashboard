import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { AddClientButton } from "@/features/clients/client-actions";
import { ClientDirectory } from "@/features/clients/client-directory";

export const metadata: Metadata = { title: "Clients · Medisense" };

export default function ClientsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Clinical"
        title="Clients"
        description="Every client across Brisbane North and South, with funding, plan review dates and anything that needs review."
        actions={<AddClientButton />}
      />
      <ClientDirectory />
    </PageContainer>
  );
}
