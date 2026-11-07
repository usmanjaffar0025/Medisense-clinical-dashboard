import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { HospitalOperations } from "@/features/hospital/hospital";

export const metadata: Metadata = { title: "Hospital operations · Medisense" };

export default function HospitalOperationsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Business"
        title="Hospital operations"
        description="Inpatient referrals, wards and theatre, with the same review and approval model."
      />
      <HospitalOperations />
    </PageContainer>
  );
}
