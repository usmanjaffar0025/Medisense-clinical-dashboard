"use client";

import { dt } from "@/lib/clock";
import { ArrowRight, Check, ListChecks, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { CaseNoteSample } from "@/data/case-note";
import type { SuggestedTask } from "@/data/tasks";
import { cn } from "@/lib/cn";
import { useDemoStore, type CaseNoteGeneration } from "@/state/demo-store";

/** Gaps the AI found in the note. Advisory: approval is not blocked, but the reviewer sees them. */
export function MissingInformation({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (items.length === 0) return null;
  const done = items.filter((_, i) => checked[i]).length;

  return (
    <section
      aria-label="Missing information"
      className="rounded-control border border-border bg-monitor-bg px-4 py-3"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-small font-semibold text-monitor">
          <TriangleAlert className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Check before approving · {items.length} possible gaps
        </span>
        <Caption>
          {done} of {items.length} reviewed
        </Caption>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2 text-small text-ink-900">
              <input
                type="checkbox"
                checked={checked[i] ?? false}
                onChange={() => setChecked({ ...checked, [i]: !checked[i] })}
                className="mt-0.5 size-4 accent-accent"
              />
              <span className={cn(checked[i] && "text-ink-500 line-through")}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Draft, edit and approval versions for this note, read from the audit trail. */
export function VersionHistory({ sample }: { sample: CaseNoteSample }) {
  const audit = useDemoStore((s) => s.audit);
  const object = `${sample.client}, session ${sample.sessionDate}`;
  const versions = audit
    .filter((e) => e.object === object)
    .sort((a, b) => a.time.localeCompare(b.time));
  if (versions.length === 0) return null;

  return (
    <details className="group rounded-control border border-border bg-surface px-4 py-2.5">
      <summary className="cursor-pointer text-small font-semibold text-ink-700">
        Version history · {versions.length} {versions.length === 1 ? "entry" : "entries"}
      </summary>
      <ol className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
        {versions.map((v, i) => (
          <li key={v.id} className="grid grid-cols-[28px_44px_minmax(0,1fr)] gap-2 text-small">
            <span className="font-semibold text-ink-500">v{i + 1}</span>
            <span className="font-mono text-caption leading-5 text-ink-700">{v.time}</span>
            <span>
              <span className={cn("font-semibold", v.isAi ? "text-brass" : "text-ink-900")}>
                {v.actor}
              </span>{" "}
              · {v.action}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function suggestionsFor(
  sample: CaseNoteSample,
  generation: CaseNoteGeneration | null,
  nextActions: string[],
) {
  if (!generation || generation.source === "scripted") return sample.suggestedTasks;
  return nextActions.slice(0, 3).map((action): SuggestedTask => ({
    title: action,
    owner: sample.clinician,
    due: dt("Tue 27 Oct"),
    type: "Client follow-up",
    priority: "Medium",
  }));
}

/** After approval, proposes follow-up tasks from the note; they are created only on confirmation. */
export function FollowUpSuggestions({
  sample,
  generation,
  nextActions,
}: {
  sample: CaseNoteSample;
  generation: CaseNoteGeneration | null;
  nextActions: string[];
}) {
  const created = useDemoStore((s) => s.caseNotes[sample.id]?.tasksCreated ?? 0);
  const createTasks = useDemoStore((s) => s.createTasksFromNote);
  const suggestions = suggestionsFor(sample, generation, nextActions);
  const [selected, setSelected] = useState<boolean[]>(() => suggestions.map(() => true));
  if (suggestions.length === 0) return null;

  if (created > 0) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-healthy-bg px-4 py-3"
      >
        <span className="flex items-center gap-2 text-small font-semibold text-healthy">
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          {created} follow-up {created === 1 ? "task" : "tasks"} created and assigned · logged to
          audit trail
        </span>
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-small font-semibold">
          Open tasks
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const chosen = suggestions.filter((_, i) => selected[i]);

  return (
    <section
      aria-label="Suggested follow-ups"
      className="rounded-control border border-border bg-surface px-4 py-3"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-small font-semibold">
          <PenNib className="size-3.5 text-brass" />
          Follow-ups found in this note
        </span>
        <Caption>Nothing is created until you confirm</Caption>
      </div>
      <ul className="flex flex-col gap-1.5">
        {suggestions.map((t, i) => (
          <li key={t.title}>
            <label className="grid cursor-pointer grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-2 text-small">
              <input
                type="checkbox"
                checked={selected[i] ?? false}
                onChange={() => setSelected(selected.map((v, j) => (j === i ? !v : v)))}
                className="mt-0.5 size-4 accent-accent"
              />
              <span>
                <span className="font-semibold">{t.title}</span>
                <span className="block text-caption text-ink-500">
                  {t.owner} · due {t.due} · {t.type}
                </span>
              </span>
              <Tag
                tone={
                  t.priority === "High" ? "over" : t.priority === "Medium" ? "monitor" : "neutral"
                }
              >
                {t.priority}
              </Tag>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-2.5 flex items-center gap-2 border-t border-border pt-2.5">
        <Button
          size="sm"
          variant="primary"
          disabled={chosen.length === 0}
          onClick={() => createTasks(sample.id, chosen)}
        >
          <ListChecks className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          Create {chosen.length} {chosen.length === 1 ? "task" : "tasks"}
        </Button>
        <Caption>Tasks appear in Tasks and in each owner’s day.</Caption>
      </div>
    </section>
  );
}
