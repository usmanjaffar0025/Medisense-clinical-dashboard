"use client";

import { dt } from "@/lib/clock";
import { Check, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchField } from "@/components/ui/search-field";
import { FilterBar, FilterField, Segmented, SelectField } from "@/components/ui/segmented";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import {
  ESCALATE_AFTER_DAYS,
  escalationOwner,
  isEscalated,
  isOverdue,
  taskTypes,
  type Task,
  type TaskType,
} from "@/data/tasks";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

type StatusFilter = "open" | "overdue" | "done" | "all";

const COLUMNS =
  "minmax(220px,2fr) minmax(120px,1fr) minmax(120px,1fr) 112px 128px 76px 120px 128px";

const priorityTone = { High: "over", Medium: "monitor", Low: "neutral" } as const;

function Due({ task }: { task: Task }) {
  if (task.done) return <span className="text-ink-500">{task.due}</span>;
  if (task.daysOverdue > 0) {
    return (
      <span className="font-semibold text-over">
        {task.due}
        <span className="block text-caption font-medium">{task.daysOverdue}d overdue</span>
      </span>
    );
  }
  if (task.daysOverdue === 0) return <span className="font-semibold">Today</span>;
  return <span>{task.due}</span>;
}

export function TasksWorkspace() {
  const tasks = useDemoStore((s) => s.tasks);
  const completeTask = useDemoStore((s) => s.completeTask);
  const [status, setStatus] = useState<StatusFilter>("open");
  const [owner, setOwner] = useState("all");
  const [type, setType] = useState<"all" | TaskType>("all");
  const [query, setQuery] = useState("");

  const open = tasks.filter((t) => !t.done);
  const overdue = tasks.filter(isOverdue);
  const escalated = tasks.filter(isEscalated);
  const dueToday = open.filter((t) => t.daysOverdue === 0);
  const fromAi = tasks.filter((t) => t.source.startsWith("AI"));
  const done = tasks.filter((t) => t.done);
  const owners = [...new Set(tasks.map((t) => t.owner))].sort();

  const rows = tasks
    .filter((t) =>
      status === "all"
        ? true
        : status === "done"
          ? t.done
          : status === "overdue"
            ? isOverdue(t)
            : !t.done,
    )
    .filter((t) => owner === "all" || t.owner === owner)
    .filter((t) => type === "all" || t.type === type)
    .filter((t) => `${t.title} ${t.client}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(a.done) - Number(b.done) || b.daysOverdue - a.daysOverdue);

  const byOwner = owners
    .map((o) => ({
      owner: o,
      overdue: open.filter((t) => t.owner === o && t.daysOverdue > 0).length,
      onTrack: open.filter((t) => t.owner === o && t.daysOverdue <= 0).length,
    }))
    .filter((r) => r.overdue + r.onTrack > 0)
    .sort((a, b) => b.overdue + b.onTrack - (a.overdue + a.onTrack));

  const byType = taskTypes
    .map((t) => ({
      id: t,
      label: t,
      value: open.filter((x) => x.type === t).length,
      colour: colour.accent,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const metrics = [
    { label: "Open tasks", value: open.length, caption: `${done.length} completed` },
    { label: "Overdue", value: overdue.length, caption: "Past their due date", tone: "over" },
    {
      label: "Escalated",
      value: escalated.length,
      caption: `Over ${ESCALATE_AFTER_DAYS} days late → ${escalationOwner}`,
      tone: "over",
    },
    { label: "Due today", value: dueToday.length, caption: dt("Tue 20 Oct") },
    { label: "Created by AI", value: fromAi.length, caption: "Confirmed by a person first" },
  ] as const;

  return (
    <>
      <section
        aria-label="Task summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span
              className={cn(
                "headline text-stat font-normal",
                "tone" in m && m.value > 0 && "text-over",
              )}
            >
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="by-owner" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="by-owner"
            title="Open tasks by owner"
            description="Overdue work sits with a few people"
          />
          <div className="mt-3">
            <StackedColumns
              label="Open tasks by owner"
              layout="vertical"
              height={byOwner.length * 30 + 30}
              labelWidth={112}
              data={byOwner}
              xKey="owner"
              series={[
                { key: "overdue", label: "Overdue", colour: colour.over },
                { key: "onTrack", label: "On track", colour: colour.series1 },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="by-type" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-3">
          <CardTitle id="by-type" title="By type" description="Click a bar to filter" />
          <div className="mt-3">
            <BarList
              label="Open tasks by type"
              data={byType}
              labelWidth={112}
              unit="open tasks"
              selected={type === "all" ? null : type}
              onSelect={(id) => setType((id as TaskType | null) ?? "all")}
            />
          </div>
        </Card>

        <Card aria-labelledby="escalations" className="flex flex-col lg:col-span-4">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="escalations"
              title="Escalations"
              description={`Overdue by more than ${ESCALATE_AFTER_DAYS} days, sent to ${escalationOwner}`}
            />
          </div>
          {escalated.length === 0 ? (
            <p className="px-5 pb-5 text-small text-ink-500">Nothing escalated.</p>
          ) : (
            escalated
              .sort((a, b) => b.daysOverdue - a.daysOverdue)
              .slice(0, 6)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 border-t border-border px-5 py-2.5"
                >
                  <CircleAlert
                    className="mt-0.5 size-4 flex-none text-over"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-small font-semibold">{t.title}</div>
                    <Caption>
                      {t.client} · {t.owner} · {t.daysOverdue} days late
                    </Caption>
                  </div>
                </div>
              ))
          )}
        </Card>
      </div>

      <div className="mt-6">
        <FilterBar aside={`Showing ${rows.length} of ${tasks.length}`}>
          <FilterField label="Status">
            <Segmented
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { id: "open", label: `Open (${open.length})` },
                { id: "overdue", label: `Overdue (${overdue.length})` },
                { id: "done", label: `Done (${done.length})` },
                { id: "all", label: "All" },
              ]}
            />
          </FilterField>
          <SelectField label="Owner" value={owner} onChange={setOwner}>
            <option value="all">Everyone</option>
            {owners.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectField>
          <SearchField
            label="Search tasks"
            placeholder="Search tasks or clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Caption className="mr-0.5">Type</Caption>
          <FilterChips
            label="Filter by type"
            value={type}
            onChange={setType}
            options={[
              { id: "all" as const, label: "All types" },
              ...taskTypes.map((t) => ({ id: t, label: t })),
            ]}
          />
        </div>
      </div>

      <Card aria-label="Tasks" className="overflow-hidden">
        <div className="overflow-x-auto" role="table" aria-label="Tasks">
          <div className="min-w-290">
            <TableHeader columns={COLUMNS}>
              <div>Task</div>
              <div>Client</div>
              <div>Owner</div>
              <div>Due</div>
              <div>Type</div>
              <div>Priority</div>
              <div>Source</div>
              <div className="text-right">Action</div>
            </TableHeader>
            {rows.map((t) => (
              <TableRow
                key={t.id}
                columns={COLUMNS}
                className={cn(
                  "min-h-14",
                  isEscalated(t) && "shadow-rule-over",
                  t.done && "opacity-60",
                )}
              >
                <div className="min-w-0 py-2">
                  {t.href ? (
                    <Link
                      href={t.href}
                      className={cn(
                        "font-semibold text-ink-900 hover:text-accent",
                        t.done && "line-through",
                      )}
                    >
                      {t.title}
                    </Link>
                  ) : (
                    <span className={cn("font-semibold", t.done && "line-through")}>{t.title}</span>
                  )}
                  {isEscalated(t) && (
                    <span className="block text-caption font-semibold text-over">
                      Escalated to {escalationOwner}
                    </span>
                  )}
                </div>
                <div className="text-ink-700">{t.client}</div>
                <div className="text-ink-700">{t.owner}</div>
                <div>
                  <Due task={t} />
                </div>
                <div className="text-ink-700">{t.type}</div>
                <div>
                  <Tag tone={priorityTone[t.priority]}>{t.priority}</Tag>
                </div>
                <div>
                  {t.source.startsWith("AI") ? (
                    <span className="inline-flex items-center gap-1 text-caption font-semibold text-brass">
                      <PenNib className="size-3.5 text-brass" />
                      {t.source}
                    </span>
                  ) : (
                    <span className="text-caption text-ink-500">{t.source}</span>
                  )}
                </div>
                <div className="text-right">
                  {t.done ? (
                    <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                      <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      Done
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => completeTask(t.id)}>
                      Mark done
                    </Button>
                  )}
                </div>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <p className="px-4 py-6 text-small text-ink-500">No tasks match these filters.</p>
            )}
          </div>
        </div>
        <Caption className="px-4 pt-3 pb-3.5">
          AI proposes tasks from approved notes and referrals; a person confirms each one before it
          is created. Every completion is logged to the audit trail.
        </Caption>
      </Card>
    </>
  );
}
