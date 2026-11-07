import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { BeforeAfter } from "@/features/story/before-after";

export const metadata: Metadata = { title: "Before and after · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <BeforeAfter />
    </PageContainer>
  );
}
