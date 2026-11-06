"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { PenNib } from "@/components/ai/provenance";
import { Caption } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { caseNotes } from "@/data/case-note";
import { cn } from "@/lib/cn";
import { useDemoStore, type CaseNoteMode } from "@/state/demo-store";

function Status({ mode }: { mode: CaseNoteMode | undefined }) {
  if (mode === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-semibold text-healthy">
        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Approved
      </span>
    );
  }
  if (mode === "draft" || mode === "edit" || mode === "generating") {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-semibold text-brass">
        <PenNib className="size-3.5 text-brass" />
        Draft ready for review
      </span>
    );
  }
  return <span className="text-caption font-medium text-ink-500">Not drafted yet</span>;
}

/** Sarah's documentation backlog, so the presenter can move between notes and show progress. */
export function CaseQueue({ activeId }: { activeId: string }) {
  const notes = useDemoStore((s) => s.caseNotes);
  const approved = caseNotes.filter((c) => notes[c.id]?.mode === "approved");
  const minutes = approved.reduce((sum, c) => sum + c.minutesSaved, 0);

  return (
    <section aria-labelledby="note-queue" className="mb-6">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="note-queue" className="eyebrow">
          Sarah’s documentation backlog · {caseNotes.length} notes
        </h2>
        <Caption>
          {approved.length} of {caseNotes.length} approved · ≈{minutes} min of writing saved
        </Caption>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-healthy-dot transition-all duration-300"
          style={{ width: `${(approved.length / caseNotes.length) * 100}%` }}
        />
      </div>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {caseNotes.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <Link
                href={`/case-notes/${c.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col gap-1.5 rounded-card border bg-surface px-4 py-3 hover:no-underline",
                  active
                    ? "border-accent-fill shadow-rule-accent"
                    : "border-border hover:border-border-strong",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-ink-900">{c.client}</span>
                  <Tag tone={c.funding === "NDIS" ? "live" : "neutral"}>{c.funding}</Tag>
                </span>
                <span className="truncate text-caption text-ink-500">
                  {c.service} · {c.sessionDate}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <Status mode={notes[c.id]?.mode} />
                  {c.backlog.kind === "overdue" && notes[c.id]?.mode !== "approved" && (
                    <span className="text-caption font-semibold text-over">
                      {c.backlog.days}d overdue
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
