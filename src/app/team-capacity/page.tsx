import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page";
import { TeamCapacity } from "@/features/capacity/team-capacity";

export const metadata: Metadata = { title: "Team capacity · Medisense" };

export default function TeamCapacityPage() {
  return (
    <PageContainer>
      <TeamCapacity />
    </PageContainer>
  );
}
