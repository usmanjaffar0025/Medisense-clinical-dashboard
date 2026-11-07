import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { AdminQueue } from "@/features/admin-queue/admin-queue";

export const metadata: Metadata = { title: "Work queue · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <AdminQueue />
    </PageContainer>
  );
}
