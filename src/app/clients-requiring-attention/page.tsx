import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { clinicians } from "@/data/clinicians";
import { AttentionWorkspace } from "@/features/attention/attention-table";

export const metadata: Metadata = { title: "Clients requiring attention · Medisense" };

export default function ClientsRequiringAttentionPage() {
  const activeClients = clinicians.reduce((sum, c) => sum + c.active, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Organisation · ${activeClients} active clients · continuity of care`}
        title="Clients requiring attention"
        description="Requires review based on configured indicators: long appointment gaps, repeated cancellations, overdue follow-ups and pending reports."
        actions={
          <Button variant="ghost">
            <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Configure indicators
          </Button>
        }
      />
      <AttentionWorkspace />
    </PageContainer>
  );
}
