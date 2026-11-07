"use client";

import { Bell, Check, CircleAlert, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { TaskTag, type TaskStatus } from "@/components/ai/marks";
import { PenNib } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { LevelDot } from "@/components/ui/dot";
import { FilterChips } from "@/components/ui/filter-chips";
import { ScreenTitle } from "@/components/ui/page";
import { SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { formDraftById } from "@/data/forms";
import { adminTeam } from "@/data/story";
import { isEscalated, isOverdue, type Task } from "@/data/tasks";
import { cn } from "@/lib/cn";
import type { QueueAdvice } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { isAdminOwner } from "@/state/story-selectors";
import { useStoryAi } from "@/state/use-story-ai";

type Filter = "team" | "mine" | "today" | "overdue" | "escalated";

const COLUMNS = "minmax(280px,2.6fr) minmax(112px,1fr) 96px minmax(128px,1fr) 84px 104px 184px";
const EXCEPTION_FORM = "at-ava";
const ME = "Jo Marsh";

const statusOf = (t: Task): TaskStatus =>
  t.done
    ? "Done"
    : isEscalated(t)
      ? "Escalated"
      : isOverdue(t)
        ? "Overdue"
        : t.daysOverdue === 0
          ? "Due today"
          : "Scheduled";

const dueLabel = (t: Task) =>
  t.daysOverdue > 0
    ? `${t.due}, ${t.daysOverdue} ${t.daysOverdue === 1 ? "day" : "days"} late`
    : t.daysOverdue === 0
      ? "Today"
      : t.due;

const sourceLabel = (t: Task) =>
  t.source === "AI from note"
    ? `AI found in ${t.client === "Oliver Grant" ? "Sarah's note, today" : "a note"}`
    : t.source === "AI from referral"
      ? "AI read a referral"
      : t.source === "Automation"
        ? "Automation rule"
        : "Added by staff";

const matches: Record<Filter, (t: Task) => boolean> = {
  team: () => true,
  mine: (t) => t.owner === ME,
  today: (t) => statusOf(t) === "Due today",
  overdue: (t) => statusOf(t) === "Overdue" || statusOf(t) === "Escalated",
  escalated: (t) => statusOf(t) === "Escalated",
};

const emptyCopy: Record<Filter, string> = {
  team: "Nothing waiting. New tasks from approved notes will appear here.",
  mine: "Nothing assigned to you. Pick up a task from Team when you're ready.",
  today: "Nothing due today.",
  overdue: "Nothing overdue.",
  escalated: "Nothing escalated.",
};

function preparedAdvice(tasks: Task[]): QueueAdvice {
  const load = (name: string) => tasks.filter((t) => t.owner === name).length;
  const lightest = [...adminTeam].sort((a, b) => load(a) - load(b))[0] ?? ME;
  return {
    order: [...tasks].sort((a, b) => b.daysOverdue - a.daysOverdue).map((t) => t.id),
    suggestions: tasks
      .filter((t) => t.owner === "Admin team")
      .map((t) => ({ taskId: t.id, owner: lightest, reason: "has the fewest open tasks" })),
  };
}

function Exception() {
  const form = useDemoStore((s) => s.forms[EXCEPTION_FORM]);
  const submit = useDemoStore((s) => s.submitForm);
  const [retrying, setRetrying] = useState(false);
  const draft = formDraftById(EXCEPTION_FORM);
  if (form?.status !== "error" || !draft) return null;

  return (
    <section
      aria-labelledby="exceptions"
      className="mb-6 rounded-card border border-border bg-surface shadow-rule-over surface-lift"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CircleAlert
            className="mt-1 size-4 flex-none text-over"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <h2 id="exceptions" className="headline text-h2">
              1 exception: a form didn&apos;t sync
            </h2>
            <p className="mt-0.5 max-w-180 text-small text-ink-700">
              {draft.client}&apos;s {draft.template.toLowerCase()} timed out on its way to the
              practice management system at 10:19 am. The form is safe. Retry first, and if it fails
              again, open the form and check it.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href={`/forms?form=${EXCEPTION_FORM}`}>Open form</ButtonLink>
          <Button
            variant="primary"
            disabled={retrying}
            onClick={() => {
              setRetrying(true);
              window.setTimeout(() => {
                submit(EXCEPTION_FORM);
                setRetrying(false);
              }, 900);
            }}
          >
            <RefreshCw
              className={cn("size-4", retrying && "animate-spin motion-reduce:animate-none")}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {retrying ? "Retrying sync" : "Retry sync"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Reassign({
  task,
  suggestion,
  onClose,
}: {
  task: Task;
  suggestion?: QueueAdvice["suggestions"][number];
  onClose: () => void;
}) {
  const reassign = useDemoStore((s) => s.reassignTask);
  const options = [...adminTeam, "Admin team"].filter((o) => o !== task.owner);
  const [to, setTo] = useState(suggestion?.owner ?? options[0] ?? ME);
  return (
    <div
      role="group"
      aria-label={`Reassign ${task.title}`}
      className="flex flex-wrap items-center gap-3 border-b border-border bg-surface-sunken px-4 py-3"
    >
      <span className="text-small font-semibold">Reassign this task</span>
      {suggestion && (
        <span className="text-caption font-medium text-brass">
          AI suggests {suggestion.owner}: {suggestion.reason}
        </span>
      )}
      <SelectField label="To" value={to} onChange={setTo}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </SelectField>
      <span className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            reassign(task.id, to);
            onClose();
          }}
        >
          Reassign task
        </Button>
      </span>
    </div>
  );
}

export function AdminQueue() {
  const all = useDemoStore((s) => s.tasks);
  const complete = useDemoStore((s) => s.completeTask);
  const notices = useDemoStore((s) => s.story.notices);
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const [filter, setFilter] = useState<Filter>("team");
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [lastDone, setLastDone] = useState<string | null>(null);

  const tasks = all.filter((t) => isAdminOwner(t.owner));
  const open = tasks.filter((t) => !t.done);
  const facts = open.map((t) => ({
    id: t.id,
    title: t.title,
    owner: t.owner,
    daysLate: t.daysOverdue,
    status: statusOf(t),
    priority: t.priority,
  }));
  const advice = useStoryAi<QueueAdvice>(
    `queue:${dayOffset}:${open.map((t) => `${t.id}=${t.owner}`).join(",")}`,
    { kind: "queue", tasks: facts, team: adminTeam },
    preparedAdvice(open),
  );

  const order = advice.data?.order ?? [];
  const rank = (t: Task) => {
    const i = order.indexOf(t.id);
    return i === -1 ? order.length + (t.daysOverdue > 0 ? 0 : 1) : i;
  };
  const sorted = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || rank(a) - rank(b) || b.daysOverdue - a.daysOverdue,
  );
  const rows = sorted.filter(matches[filter]);
  const count = (f: Filter) => open.filter(matches[f]).length;
  const fresh = open.find((t) => t.source === "AI from note" && t.client === "Oliver Grant");
  const reminder = notices.find((n) => n.to === "Admin" && n.text.startsWith("Due today"));
  const aiSorted = advice.meta?.source === "live";

  return (
    <>
      <ScreenTitle
        title="Work queue"
        description={
          open.length === 0
            ? "You're up to date."
            : fresh && dayOffset === 0
              ? "Oliver's task has just arrived from Sarah's note. Start with what's escalated or due today."
              : "Start with what's escalated or due today."
        }
      />

      <Exception />

      {reminder && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-card bg-monitor-bg px-5 py-3 text-small font-semibold text-monitor">
          <Bell className="size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
          Reminder, 8:00 am. {reminder.text}.
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filter the queue"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "team", label: "Team", count: count("team") },
            { id: "mine", label: "Mine", count: count("mine") },
            { id: "today", label: "Due today", count: count("today") },
            { id: "overdue", label: "Overdue", count: count("overdue") },
            { id: "escalated", label: "Escalated", count: count("escalated") },
          ]}
        />
        <Caption className={cn(aiSorted && "text-brass")}>
          {advice.loading
            ? "AI is sorting these…"
            : aiSorted
              ? "AI sorted these by what needs you first"
              : "Sorted by what needs you first"}
        </Caption>
      </div>

      <Card aria-label="Tasks" className="overflow-hidden">
        <div className="overflow-x-auto" role="table" aria-label="Admin tasks">
          <div className="min-w-280">
            <TableHeader columns={COLUMNS}>
              <div role="columnheader">Task and source</div>
              <div role="columnheader">Client</div>
              <div role="columnheader">Owner</div>
              <div role="columnheader">Due</div>
              <div role="columnheader">Priority</div>
              <div role="columnheader">Status</div>
              <div role="columnheader" className="text-right">
                Action
              </div>
            </TableHeader>
            {rows.map((t) => {
              const status = statusOf(t);
              const isFresh = t.id === fresh?.id && dayOffset === 0;
              return (
                <Fragment key={t.id}>
                  <TableRow
                    columns={COLUMNS}
                    className={cn(
                      "min-h-16",
                      isFresh && "bg-accent-tint hover:bg-accent-tint",
                      status === "Escalated" && "shadow-rule-over",
                      t.done && "opacity-60",
                    )}
                  >
                    <div role="cell" className="min-w-0 py-2.5">
                      <div className={cn("font-semibold", t.done && "line-through")}>{t.title}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-caption font-medium text-ink-500">
                        {t.source.startsWith("AI") && <PenNib className="size-3 text-brass" />}
                        {t.href && t.source === "AI from note" ? (
                          <Link href={t.href} className="font-semibold">
                            {sourceLabel(t)}
                          </Link>
                        ) : (
                          sourceLabel(t)
                        )}
                      </div>
                    </div>
                    <div role="cell" className="text-ink-700">
                      {t.client}
                    </div>
                    <div role="cell" className="text-ink-700">
                      {t.owner}
                    </div>
                    <div
                      role="cell"
                      className={cn(status === "Escalated" && "font-semibold text-over")}
                    >
                      {dueLabel(t)}
                    </div>
                    <div role="cell">
                      <span className="flex items-center gap-1.5">
                        <LevelDot level={t.priority} />
                        {t.priority}
                      </span>
                    </div>
                    <div role="cell">
                      <TaskTag status={status} />
                    </div>
                    <div role="cell" className="flex justify-end gap-1">
                      {t.done ? (
                        <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                          <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                          Task done
                        </span>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-expanded={reassigning === t.id}
                            onClick={() => setReassigning(reassigning === t.id ? null : t.id)}
                          >
                            Reassign
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              complete(t.id);
                              setLastDone(t.title);
                            }}
                          >
                            Mark done
                          </Button>
                        </>
                      )}
                    </div>
                  </TableRow>
                  {reassigning === t.id && (
                    <Reassign
                      task={t}
                      suggestion={advice.data?.suggestions.find((s) => s.taskId === t.id)}
                      onClose={() => setReassigning(null)}
                    />
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <p className="px-5 py-10 headline text-h2 font-normal">{emptyCopy[filter]}</p>
            )}
          </div>
        </div>
      </Card>

      {lastDone && (
        <p role="status" className="mt-3 text-small text-ink-700">
          Task done: {lastDone}. It&apos;s in the audit trail.
        </p>
      )}
    </>
  );
}
