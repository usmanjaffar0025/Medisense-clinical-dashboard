"use client";

import { Check, CircleAlert, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { LevelDot } from "@/components/ui/dot";
import { cn } from "@/lib/cn";
import { TaskTag } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { queueRows, type QueueRow } from "../_fixtures/story";

type State = "queue" | "reassign" | "completed" | "retrying" | "empty";
type Filter = "team" | "mine" | "today" | "overdue" | "escalated";

const COLUMNS = "minmax(280px,2.6fr) minmax(112px,1fr) 96px minmax(128px,1fr) 84px 104px 184px";

const matches: Record<Filter, (r: QueueRow) => boolean> = {
  team: () => true,
  mine: (r) => r.mine,
  today: (r) => r.status === "Due today",
  overdue: (r) => r.status === "Overdue" || r.status === "Escalated",
  escalated: (r) => r.status === "Escalated",
};

const emptyCopy: Record<Filter, string> = {
  team: "Nothing waiting. New tasks from approved notes will appear here.",
  mine: "Nothing assigned to you. Pick up a task from Team when you're ready.",
  today: "Nothing due today.",
  overdue: "Nothing overdue.",
  escalated: "Nothing escalated.",
};

function Exception({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) {
  return (
    <section
      aria-labelledby="exceptions"
      className="mb-6 rounded-card border border-border bg-surface shadow-rule-over"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
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
              Ruth Hallam&apos;s home modification funding request timed out on its way to the
              practice management system at 10:19 am. The form is safe. AI suggests retrying first,
              and if it fails again, open the form and check it.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/forms?form=home-mod-ruth">Open form</ButtonLink>
          <Button variant="primary" disabled={retrying} onClick={onRetry}>
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

function Reassign({ row, onClose }: { row: QueueRow; onClose: () => void }) {
  const [to, setTo] = useState("Sam Doyle");
  return (
    <div
      role="group"
      aria-label={`Reassign ${row.title}`}
      className="flex flex-wrap items-center gap-3 border-b border-border bg-surface-sunken px-4 py-3"
    >
      <span className="text-small font-semibold">Reassign this task</span>
      <span className="text-caption font-medium text-brass">
        AI suggests Sam Doyle, who has the fewest open tasks
      </span>
      <SelectField label="To" value={to} onChange={setTo}>
        <option>Sam Doyle</option>
        <option>Jo Marsh</option>
        <option>Admin team</option>
      </SelectField>
      <span className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" onClick={onClose}>
          Reassign task
        </Button>
      </span>
    </div>
  );
}

export function AdminQueueView() {
  const [state, setState] = usePreviewState<State>("queue");
  const [filter, setFilter] = useState<Filter>("team");
  const all = state === "empty" ? [] : queueRows;
  const rows = all.filter(matches[filter]);
  const count = (f: Filter) => all.filter(matches[f]).length;

  return (
    <>
      <PreviewBar href="/design-preview/admin-queue" />
      <Shell persona="jo" active="Work queue" section="Admin" page="Work queue">
        <ScreenTitle
          title="Work queue"
          description={
            state === "empty"
              ? "You're up to date."
              : "Oliver's report upload has just arrived from Sarah's note. Start with what's escalated or due today."
          }
        />

        {state !== "empty" && (
          <Exception retrying={state === "retrying"} onRetry={() => setState("retrying")} />
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
          <Caption>AI sorted these by what needs you first</Caption>
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
              {rows.map((r) => {
                const done = state === "completed" && r.id === "upload";
                return (
                  <Fragment key={r.id}>
                    <TableRow
                      columns={COLUMNS}
                      className={cn(
                        "min-h-16",
                        r.isNew && !done && "bg-accent-tint hover:bg-accent-tint",
                        r.status === "Escalated" && "shadow-rule-over",
                      )}
                    >
                      <div role="cell" className="min-w-0 py-2.5">
                        <div className={cn("font-semibold", done && "text-ink-500 line-through")}>
                          {r.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-caption font-medium text-ink-500">
                          {r.fromAi && <PenNib className="size-3 text-brass" />}
                          {r.isNew ? (
                            <Link
                              href="/design-preview/prepared?state=confirmed"
                              className="font-semibold"
                            >
                              {r.source}
                            </Link>
                          ) : (
                            r.source
                          )}
                        </div>
                      </div>
                      <div role="cell" className="text-ink-700">
                        {r.client}
                      </div>
                      <div role="cell" className="text-ink-700">
                        {r.owner}
                      </div>
                      <div
                        role="cell"
                        className={cn(r.status === "Escalated" && "font-semibold text-over")}
                      >
                        {r.due}
                      </div>
                      <div role="cell">
                        <span className="flex items-center gap-1.5">
                          <LevelDot level={r.priority} />
                          {r.priority}
                        </span>
                      </div>
                      <div role="cell">
                        <TaskTag status={done ? "Done" : r.status} />
                      </div>
                      <div role="cell" className="flex justify-end gap-1">
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                            <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                            Task done
                          </span>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setState("reassign")}>
                              Reassign
                            </Button>
                            <Button size="sm" onClick={() => setState("completed")}>
                              Mark done
                            </Button>
                          </>
                        )}
                      </div>
                    </TableRow>
                    {state === "reassign" && r.id === "upload" && (
                      <Reassign row={r} onClose={() => setState("queue")} />
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

        {state === "completed" && (
          <p role="status" className="mt-3 text-small text-ink-700">
            Task done. Sarah can see the report on Oliver&apos;s record, and this is in the audit
            trail.
          </p>
        )}
      </Shell>
    </>
  );
}
