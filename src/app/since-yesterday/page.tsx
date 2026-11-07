import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { SinceYesterday } from "@/features/story/since-yesterday";

export const metadata: Metadata = { title: "Since yesterday · Medisense" };

export default function Page() {
  return (
    <PageContainer>
      <SinceYesterday />
    </PageContainer>
  );
}
