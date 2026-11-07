"use client";

import { Bell, CircleAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { TaskTag } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { skipAudit, story } from "../_fixtures/story";

type State = "neil" | "admin" | "audit";

const escalationSteps = [
  { day: "Thu 15 Oct", text: "Due. Parent call-back assigned to Sarah Thompson.", now: false },
  { day: "Tue 20 Oct", text: "3 working days late. Sarah sees it in My Day.", now: false },
  { day: "Wed 21 Oct, 8:00 am", text: "4 working days late. Escalated to Grace Liu.", now: true },
];

function Escalation() {
  return (
    <section
      aria-labelledby="escalated"
      className="rounded-card border border-border bg-surface px-6 pt-5 pb-5 shadow-rule-over"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="escalated" className="headline text-h2">
            Isla Murphy&apos;s call-back was escalated to Grace Liu
          </h2>
          <p className="mt-0.5 text-small text-ink-700">
            Tasks go to the supervisor when they&apos;re more than 3 working days late.
          </p>
        </div>
        <TaskTag status="Escalated" />
      </div>
      <ol className="mt-4 border-l border-border-strong">
        {escalationSteps.map((s) => (
          <li key={s.day} className="relative pb-3 pl-4 last:pb-0">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1.5 -left-1 size-2 rounded-full",
                s.now ? "bg-over-dot" : "bg-ink-400",
              )}
            />
            <span className={cn("block text-small font-semibold", s.now && "text-over")}>
              {s.day}
            </span>
            <span className="text-small text-ink-700">{s.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3.5">
        <ButtonLink href="/design-preview/supervision" variant="primary">
          Open Grace&apos;s AI brief
        </ButtonLink>
        <Caption>AI added it to the Pending follow-ups section of Thursday&apos;s brief.</Caption>
      </div>
    </section>
  );
}

function AuditList({ limit }: { limit?: number }) {
  const rows = limit ? skipAudit.slice(0, limit) : skipAudit;
  return (
    <ol className="border-l border-border">
      {rows.map((e) => (
        <li key={`${e.time}-${e.action}`} className="relative pb-4 pl-4 last:pb-0">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 -left-1 size-1.75 rounded-full",
              e.actor === "Medisense AI" ? "bg-brass" : "bg-accent",
            )}
          />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-caption text-ink-700">{e.time}</span>
            <span className="text-small font-semibold">{e.actor}</span>
            <span className="text-caption font-medium text-ink-500">{e.role}</span>
          </div>
          <div className="text-small">{e.action}</div>
          <div className="text-caption font-medium text-ink-500">{e.object}</div>
        </li>
      ))}
    </ol>
  );
}

function DueDateRule() {
  return (
    <section
      aria-labelledby="due-rule"
      className="mt-6 border-t border-border-strong pt-5 font-mono text-caption text-ink-700"
    >
      <h2 id="due-rule" className="font-medium text-ink-900">
        For review, not product UI: the due-date rule behind this screen
      </h2>
      <ul className="mt-2 flex flex-col gap-1">
        <li>
          A due date that lands on a Saturday, Sunday or Queensland public holiday moves to the next
          working day.
        </li>
        <li>Days late count working days only, so a weekend never makes a task escalate.</li>
        <li>Advance 1 day moves to the next working day: Friday then Monday.</li>
        <li>Example: 2 working days from Thu 22 Oct is Mon 26 Oct, not Sat 24 Oct.</li>
      </ul>
    </section>
  );
}

export function TimeSkipView() {
  const [state] = usePreviewState<State>("neil");

  return (
    <>
      <PreviewBar href="/design-preview/time-skip" />
      {state === "neil" && (
        <Shell
          persona="neil"
          active="Overview"
          section="Organisation"
          page="Since yesterday"
          date={story.tomorrow}
          bellCount={1}
        >
          <ScreenTitle
            title="Since yesterday"
            description="Overnight, automation rules sent 1 reminder, escalated 1 task and marked 1 overdue, and AI updated Grace's brief. Nothing clinical changed without a person."
            actions={
              <ButtonLink href="/design-preview/overview?state=skipped">
                Back to Overview
              </ButtonLink>
            }
          />
          <div className="grid items-start gap-6 xl:grid-cols-12">
            <div className="flex flex-col gap-6 xl:col-span-7">
              <Escalation />
              <Card aria-labelledby="reminder" className="px-6 pt-4.5 pb-4.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <Bell
                      className="mt-1 size-4 flex-none text-ink-500"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <h2 id="reminder" className="text-h3 font-semibold">
                        A reminder went to the admin team
                      </h2>
                      <p className="text-small text-ink-700">
                        Oliver Grant&apos;s report upload is due today. It shows on their
                        notifications bell and at the top of their work queue.
                      </p>
                    </div>
                  </div>
                  <TaskTag status="Due today" />
                </div>
              </Card>
              <Card aria-labelledby="newly-overdue" className="px-6 pt-4.5 pb-4.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <CircleAlert
                      className="mt-1 size-4 flex-none text-ink-500"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <h2 id="newly-overdue" className="text-h3 font-semibold">
                        One task became overdue
                      </h2>
                      <p className="text-small text-ink-700">
                        Hannah Wright&apos;s call to Poppy Shaw&apos;s parent was due on Tuesday. It
                        stays with Hannah until it&apos;s more than 3 working days late.
                      </p>
                    </div>
                  </div>
                  <TaskTag status="Overdue" />
                </div>
              </Card>
            </div>
            <Card aria-labelledby="audit-side" className="px-5 pt-4.5 pb-5 xl:col-span-5">
              <h2 id="audit-side" className="mb-3 headline text-h2">
                Audit trail
              </h2>
              <AuditList limit={4} />
            </Card>
          </div>
          <DueDateRule />
        </Shell>
      )}

      {state === "admin" && (
        <Shell
          persona="jo"
          active="Work queue"
          section="Admin"
          page="Work queue"
          date={story.tomorrow}
          bellCount={1}
        >
          <ScreenTitle
            title="Work queue"
            description="One reminder this morning. Oliver's report upload moved to the top because it's due today."
          />
          <Card aria-label="Reminder" className="mb-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-monitor-bg px-5 py-3">
              <span className="flex items-center gap-2 text-small font-semibold text-monitor">
                <Bell className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Reminder, 8:00 am: Oliver Grant&apos;s report upload is due today
              </span>
              <ButtonLink href="/design-preview/admin-queue" size="sm">
                Open work queue
              </ButtonLink>
            </div>
          </Card>
          <Card aria-label="Tasks due" className="overflow-hidden">
            <div role="table" aria-label="Tasks due" className="overflow-x-auto">
              <div className="min-w-180">
                <TableHeader columns="minmax(240px,2fr) minmax(120px,1fr) 128px 104px">
                  <div role="columnheader">Task</div>
                  <div role="columnheader">Client</div>
                  <div role="columnheader">Due</div>
                  <div role="columnheader">Status</div>
                </TableHeader>
                <TableRow columns="minmax(240px,2fr) minmax(120px,1fr) 128px 104px">
                  <div role="cell" className="font-semibold">
                    Upload the paediatrician report to Oliver&apos;s record
                  </div>
                  <div role="cell" className="text-ink-700">
                    Oliver Grant
                  </div>
                  <div role="cell" className="font-semibold">
                    Today
                  </div>
                  <div role="cell">
                    <TaskTag status="Due today" />
                  </div>
                </TableRow>
                <TableRow columns="minmax(240px,2fr) minmax(120px,1fr) 128px 104px">
                  <div role="cell" className="font-semibold">
                    Request signed telehealth consent
                  </div>
                  <div role="cell" className="text-ink-700">
                    Sophie Williams
                  </div>
                  <div role="cell" className="font-semibold">
                    Today
                  </div>
                  <div role="cell">
                    <TaskTag status="Due today" />
                  </div>
                </TableRow>
              </div>
            </div>
          </Card>
        </Shell>
      )}

      {state === "audit" && (
        <Shell
          persona="neil"
          active="Overview"
          section="Organisation"
          page="Audit trail"
          date={story.tomorrow}
          bellCount={1}
        >
          <ScreenTitle
            title="Audit trail, Wednesday 21 October"
            description="Each entry names what did it. Rules appear as Automation, AI as Medisense AI, and people under their real role."
            actions={<Tag tone="neutral">5 entries</Tag>}
          />
          <Card className="max-w-200 px-6 pt-5 pb-6">
            <AuditList />
          </Card>
        </Shell>
      )}
    </>
  );
}
