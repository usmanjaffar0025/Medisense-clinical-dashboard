import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { SarahDay } from "@/features/my-day/sarah-day";

export const metadata: Metadata = { title: "My day · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <SarahDay />
    </PageContainer>
  );
}
