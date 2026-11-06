import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { AdminOperations } from "@/features/admin-operations/admin-operations";

export const metadata: Metadata = { title: "Admin operations · Medisense" };

export default function AdminOperationsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Intake & admin"
        title="Admin operations"
        description="Today's admin queues, plan and agreement expiries, and staff compliance in one place, with reminders sent before anything lapses."
      />
      <AdminOperations />
    </PageContainer>
  );
}
