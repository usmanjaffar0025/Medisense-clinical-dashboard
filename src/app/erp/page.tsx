import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { Erp } from "@/features/erp/erp";

export const metadata: Metadata = { title: "ERP · Medisense" };

export default function ErpPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Business"
        title="ERP"
        description="Finance, HR, payroll and purchasing in one place."
      />
      <Erp />
    </PageContainer>
  );
}
