import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { SessionNote } from "@/features/session/session-note";

export const metadata: Metadata = { title: "Oliver Grant · AI session note · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <SessionNote />
    </PageContainer>
  );
}
