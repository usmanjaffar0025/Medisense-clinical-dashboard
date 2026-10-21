import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const items = [
  {
    eyebrow: "Capacity",
    urgent: true,
    title: "Sarah Thompson is above configured capacity.",
    detail: "27 of 25 · 6 high-complexity · 4 notes overdue",
    action: "Review caseload",
    href: "/caseloads/sarah-thompson",
  },
  {
    eyebrow: "Clients",
    title: "14 clients require review.",
    detail: "2 high priority",
    action: "Open list",
    href: "/clients-requiring-attention",
  },
  {
    eyebrow: "Supervision",
    title: "5 supervision sessions in the next 14 days.",
    detail: "Next: Sarah Thompson, Thu 2:00 pm",
    action: "Prepare",
    href: "/supervision/sarah-thompson",
  },
];

export function AttentionPanel() {
  return (
    <Card aria-labelledby="needs-attention">
      <div className="px-5 pt-5 pb-3.5">
        <h2 id="needs-attention" className="headline text-h2">
          Needs your attention
        </h2>
      </div>
      {items.map((item) => (
        <div
          key={item.eyebrow}
          className="flex flex-col gap-1.5 border-t border-border px-5 py-4.5"
        >
          <div className={cn("eyebrow", item.urgent && "text-over")}>{item.eyebrow}</div>
          <div className="font-semibold">{item.title}</div>
          <div className="text-small text-ink-700">{item.detail}</div>
          <ButtonLink href={item.href} className="mt-1.5 self-start">
            {item.action}
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </ButtonLink>
        </div>
      ))}
      <p className="rounded-b-card border-t border-border bg-surface-sunken px-5 pt-3.5 pb-4 text-caption font-medium text-ink-500">
        Operational indicators only. Not clinical risk assessments.
      </p>
    </Card>
  );
}
