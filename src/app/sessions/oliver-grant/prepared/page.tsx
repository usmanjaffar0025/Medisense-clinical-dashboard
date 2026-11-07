import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { PreparedView } from "@/features/session/prepared-view";

export const metadata: Metadata = { title: "What AI prepared · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <PreparedView />
    </PageContainer>
  );
}
