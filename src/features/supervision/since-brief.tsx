"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { staffCompliance } from "@/data/admin-operations";
import { caseNotes } from "@/data/case-note";
import { scheduleWith } from "@/data/schedule";
import { isEscalated, isOverdue } from "@/data/tasks";
import { useDemoStore } from "@/state/demo-store";

const SARAH = "Sarah Thompson";

/**
 * Live picture of Sarah's week for the supervisor: what has changed in notes, tasks, schedule
 * and compliance since the AI brief was prepared at 9:15 am.
 */
export function SinceBrief() {
  const notes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const suggestions = useDemoStore((s) => s.suggestions);

  const approved = caseNotes.filter((c) => notes[c.id]?.mode === "approved").length;
  const mine = tasks.filter((t) => t.owner === SARAH);
  const open = mine.filter((t) => !t.done);
  const accepted = Object.entries(suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  const week = scheduleWith(accepted).filter(
    (i) => i.clinicianId === "sarah-thompson" && i.status !== "cancelled",
  );
  const sessions = week.filter((i) => i.type === "Home visit" || i.type === "Telehealth").length;
  const driving = week.reduce((s, i) => s + i.travel, 0) / 60;
  const compliance = staffCompliance.find((c) => c.clinician.name === SARAH)?.items ?? [];
  const due = compliance.filter((i) => i.daysLeft <= 60);

  const tiles = [
    {
      label: "Backlog notes approved",
      value: `${approved} of ${caseNotes.length}`,
      caption: approved ? "Approved today with AI drafts" : "None yet today",
      href: "/case-notes/mia-robinson",
    },
    {
      label: "Open tasks",
      value: open.length,
      caption: `${open.filter(isOverdue).length} overdue · ${open.filter(isEscalated).length} escalated`,
      href: "/tasks",
    },
    {
      label: "Sessions this week",
      value: sessions,
      caption: `${driving.toFixed(1)} h driving between visits`,
      href: "/schedule",
    },
    {
      label: "Compliance",
      value: due.length ? `${due.length} due` : "All current",
      caption: due.length
        ? due.map((d) => d.label).join(", ")
        : "Registration, Blue Card, screening",
      href: "/admin-operations",
    },
  ];

  return (
    <Card aria-labelledby="since-brief" className="overflow-hidden">
      <div className="px-5 pt-4.5 pb-3">
        <CardTitle
          id="since-brief"
          title="Since the brief was prepared"
          description="Live from notes, tasks, schedule and compliance · brief prepared 9:15 am"
          aside={<Tag tone="live">Updates as work is done</Tag>}
        />
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group flex flex-col gap-1 bg-surface px-5 py-4 hover:bg-canvas hover:no-underline"
          >
            <span className="flex items-center justify-between eyebrow">
              {t.label}
              <ArrowRight
                className="size-3.5 text-ink-400 group-hover:text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <span className="headline text-stat font-normal text-ink-900">{t.value}</span>
            <Caption>{t.caption}</Caption>
          </Link>
        ))}
      </div>
      {open.length > 0 && (
        <ul className="border-t border-border">
          {open.slice(0, 4).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 border-b border-border px-5 py-2 text-small last:border-b-0"
            >
              <span>
                <b className="font-semibold">{t.title}</b>
                <span className="text-ink-500"> · {t.client}</span>
              </span>
              <span className={t.daysOverdue > 0 ? "font-semibold text-over" : "text-ink-500"}>
                {t.daysOverdue > 0 ? `${t.daysOverdue}d overdue` : `Due ${t.due}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
