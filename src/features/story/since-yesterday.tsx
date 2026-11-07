"use client";

import { Bell, CircleAlert } from "lucide-react";
import { TaskTag } from "@/components/ai/marks";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/page";
import { isoDate, longDate } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import type { StoryEvent } from "@/state/story";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Row({ event }: { event: StoryEvent }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2 text-small">
      <span className="min-w-0">
        <span className="font-semibold">{event.client}</span>: {event.title}
        <span className="text-ink-500"> ({event.owner})</span>
      </span>
    </li>
  );
}

export function SinceYesterday() {
  const events = useDemoStore((s) => s.story.lastSkip);
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const audit = useDemoStore((s) => s.audit);

  const escalations = events.filter((e) => e.kind === "escalation");
  const reminders = events.filter((e) => e.kind === "reminder");
  const overdue = events.filter((e) => e.kind === "overdue");
  const day = isoDate(dayOffset);
  const entries = audit.filter((e) => e.day === day && e.actor === "Automation");

  if (dayOffset === 0 || events.length === 0) {
    return (
      <>
        <ScreenTitle
          title="Since yesterday"
          description="Nothing has moved overnight yet. Reminders and escalations will appear here when they fire."
        />
        <ButtonLink href="/">Back to Overview</ButtonLink>
      </>
    );
  }

  return (
    <>
      <ScreenTitle
        title="Since yesterday"
        description={`${longDate(dayOffset)}. Overnight, automation rules sent ${plural(reminders.length, "reminder")}, escalated ${plural(escalations.length, "task")} and marked ${overdue.length} overdue. Nothing clinical changed without a person.`}
        actions={<ButtonLink href="/">Back to Overview</ButtonLink>}
      />

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-7">
          {escalations.map((e) => (
            <section
              key={e.id}
              aria-label={`Escalation: ${e.client}`}
              className="rounded-card border border-border bg-surface px-6 pt-5 pb-5 shadow-rule-over surface-lift"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="headline text-h2">
                    {e.client}&apos;s task was escalated to Grace Liu
                  </h2>
                  <p className="mt-0.5 text-small text-ink-700">
                    {e.title}, with {e.owner}. Tasks go to the supervisor when they&apos;re more
                    than 3 working days late.
                  </p>
                </div>
                <TaskTag status="Escalated" />
              </div>
              <ol className="mt-4 border-l border-border-strong">
                <li className="relative pb-3 pl-4">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-1 size-2 rounded-full bg-ink-400"
                  />
                  <span className="block text-small font-semibold">Yesterday</span>
                  <span className="text-small text-ink-700">
                    {e.daysLate - 1} working days late, with {e.owner}.
                  </span>
                </li>
                <li className="relative pl-4">
                  <span
                    aria-hidden="true"
                    className={cn("absolute top-1.5 -left-1 size-2 rounded-full", "bg-over-dot")}
                  />
                  <span className="block text-small font-semibold text-over">Today, 8:00 am</span>
                  <span className="text-small text-ink-700">
                    {e.daysLate} working days late. Escalated to Grace Liu.
                  </span>
                </li>
              </ol>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3.5">
                <ButtonLink href="/supervision/sarah-thompson" variant="primary">
                  Open Grace&apos;s AI brief
                </ButtonLink>
                <Caption>AI adds it to the brief for Thursday&apos;s session.</Caption>
              </div>
            </section>
          ))}

          {reminders.length > 0 && (
            <Card aria-labelledby="reminders" className="px-6 pt-4.5 pb-3.5">
              <h2 id="reminders" className="flex items-center gap-2 text-h3 font-semibold">
                <Bell className="size-4 text-ink-500" strokeWidth={1.5} aria-hidden="true" />
                {plural(reminders.length, "reminder")} sent
              </h2>
              <p className="mb-2 text-small text-ink-700">
                Due today. These show on each owner&apos;s notifications and at the top of their
                work.
              </p>
              <ul>
                {reminders.map((e) => (
                  <Row key={e.id} event={e} />
                ))}
              </ul>
            </Card>
          )}

          {overdue.length > 0 && (
            <Card aria-labelledby="newly-overdue" className="px-6 pt-4.5 pb-3.5">
              <h2 id="newly-overdue" className="flex items-center gap-2 text-h3 font-semibold">
                <CircleAlert className="size-4 text-ink-500" strokeWidth={1.5} aria-hidden="true" />
                {plural(overdue.length, "task")} became overdue
              </h2>
              <p className="mb-2 text-small text-ink-700">
                They stay with their owner until they&apos;re more than 3 working days late.
              </p>
              <ul>
                {overdue.map((e) => (
                  <Row key={e.id} event={e} />
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card aria-labelledby="audit-side" className="px-5 pt-4.5 pb-5 xl:col-span-5">
          <h2 id="audit-side" className="mb-3 headline text-h2">
            Audit trail
          </h2>
          <ol className="border-l border-border">
            {entries.map((e) => (
              <li key={e.id} className="relative pb-4 pl-4 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-1 size-1.75 rounded-full bg-accent"
                />
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-caption text-ink-700">{e.time}</span>
                  <span className="text-small font-semibold">{e.actor}</span>
                </div>
                <div className="text-small">{e.action}</div>
                <div className="text-caption font-medium text-ink-500">{e.object}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
