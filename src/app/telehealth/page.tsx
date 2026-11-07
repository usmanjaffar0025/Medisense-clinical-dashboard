import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { Telehealth } from "@/features/telehealth/telehealth";

export const metadata: Metadata = { title: "Telehealth · Medisense" };

export default function TelehealthPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Clinical"
        title="Telehealth"
        description="Video visits from the schedule, with an AI note draft afterwards."
      />
      <Suspense fallback={<p className="text-small text-ink-500">Loading…</p>}>
        <Telehealth />
      </Suspense>
    </PageContainer>
  );
}
