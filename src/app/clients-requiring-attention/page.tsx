import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LevelDot } from "@/components/ui/dot";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { attentionClients, countByPriority, mostCommonReason } from "@/data/attention";
import { organisation } from "@/data/organisation";
import type { Priority } from "@/data/types";
import { AttentionTable } from "@/features/attention/attention-table";

export const metadata: Metadata = { title: "Clients requiring attention · Medisense" };

const priorities: Priority[] = ["High", "Medium", "Low"];

export default function ClientsRequiringAttentionPage() {
  const topReason = mostCommonReason();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Organisation · ${organisation.activeClients} active clients`}
        title="Clients requiring attention"
        description="Requires review based on configured operational indicators."
        actions={
          <Button variant="ghost">
            <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Configure indicators
          </Button>
        }
      />

      <section
        aria-label="Summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,2fr)]"
      >
        <div className="flex flex-col gap-1 bg-surface px-5 py-4">
          <span className="eyebrow">Clients</span>
          <span className="headline text-stat font-normal">{attentionClients.length}</span>
        </div>
        {priorities.map((p) => (
          <div key={p} className="flex flex-col gap-1 bg-surface px-5 py-4">
            <span className="flex items-center gap-1.5 eyebrow">
              <LevelDot level={p} />
              {p}
            </span>
            <span className="headline text-stat font-normal">{countByPriority(p)}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 bg-surface px-5 py-4">
          <span className="eyebrow">Most common reason</span>
          <span className="headline text-stat-sm leading-8 font-normal">
            {topReason.label} <span className="text-ink-500">({topReason.count})</span>
          </span>
        </div>
      </section>

      <AttentionTable />
    </PageContainer>
  );
}
