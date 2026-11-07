import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { countByPriority } from "@/data/attention";
import type { AttentionClient, Clinician } from "@/data/types";
import { cn } from "@/lib/cn";

type Item = {
  eyebrow: string;
  urgent?: boolean;
  title: string;
  detail: string;
  action: string;
  href: string;
};

export function AttentionPanel({
  list,
  attention,
}: {
  list: Clinician[];
  attention: AttentionClient[];
}) {
  const atRisk = list.filter((c) => c.status === "at-risk");
  const due = list.filter((c) => c.supervisionDue);
  const firstAtRisk = atRisk[0];
  const items: Item[] = [];

  if (firstAtRisk) {
    items.push({
      eyebrow: "Capacity",
      urgent: true,
      title: `${firstAtRisk.name} is above configured capacity.`,
      detail: `${firstAtRisk.active} of ${firstAtRisk.capacity} · ${firstAtRisk.highComplexity} high-complexity · ${firstAtRisk.notesOverdue} notes to write`,
      action: "Review caseload",
      href: "/caseloads/sarah-thompson",
    });
  }
  items.push({
    eyebrow: "Clients",
    title: `${attention.length} clients require review.`,
    detail: `${countByPriority(attention, "High")} high priority · continuity of care`,
    action: "Open queue",
    href: "/clients-requiring-attention",
  });
  const overdue = list.reduce((sum, c) => sum + c.notesOverdue, 0);
  const drafts = list.reduce((sum, c) => sum + c.draftsAwaiting, 0);
  const followUps = list.reduce((sum, c) => sum + c.followUpsOverdue, 0);
  items.push({
    eyebrow: "Documentation",
    title: `${overdue + drafts} notes due across the team.`,
    detail: `${overdue} overdue · ${drafts} AI drafts awaiting clinician approval`,
    action: "Open case notes",
    href: "/case-notes/mia-robinson",
  });
  items.push({
    eyebrow: "Follow-ups",
    title: `${followUps} client follow-ups are overdue.`,
    detail: "Surfaced from scheduling data before clients slip through gaps",
    action: "Assign owners",
    href: "/clients-requiring-attention",
  });
  items.push({
    eyebrow: "Supervision",
    title: `${due.length} supervision sessions in the next 14 days.`,
    detail: due[0] ? `Next: ${due.map((c) => c.firstName).join(", ")}` : "None scheduled",
    action: "Prepare",
    href: "/supervision/sarah-thompson",
  });

  return (
    <Card aria-labelledby="needs-attention" className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-3.5">
        <h2 id="needs-attention" className="headline text-h2">
          Needs your attention
        </h2>
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.eyebrow}
            className="flex flex-col gap-1.5 bg-surface px-5 py-4 last:sm:col-span-2 last:xl:col-span-1"
          >
            <div className={cn("eyebrow", item.urgent && "text-over")}>{item.eyebrow}</div>
            <div className="font-semibold">{item.title}</div>
            <div className="mb-2 text-small text-ink-700">{item.detail}</div>
            <ButtonLink href={item.href} className="mt-auto self-start">
              {item.action}
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </ButtonLink>
          </div>
        ))}
      </div>
      <p className="rounded-b-card border-t border-border bg-surface-sunken px-5 pt-3.5 pb-4 text-caption font-medium text-ink-500">
        Operational indicators only. Not clinical risk assessments.
      </p>
    </Card>
  );
}
