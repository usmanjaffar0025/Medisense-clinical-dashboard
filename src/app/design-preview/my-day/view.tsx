"use client";

import { Car, Check, UserCheck, Video } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { AiMark } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { sarahDay, sarahNotesDue, sarahTasks, type Visit } from "../_fixtures/story";

type State = "finished" | "approved" | "empty";

function VisitRow({ visit, state }: { visit: Visit; state: State }) {
  const current = visit.state === "just-finished";
  const done = visit.state === "done";
  const approved = current && state === "approved";

  return (
    <div
      className={cn(
        "grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 px-5 py-4 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center",
        current && !approved && "bg-accent-tint shadow-rule-accent md:py-6",
      )}
    >
      <div>
        <div className={cn("headline text-h2 leading-6 font-normal", done && "text-ink-500")}>
          {visit.start}
        </div>
        <Caption>to {visit.end}</Caption>
      </div>
      <div className="min-w-0">
        <div
          className={cn("font-semibold", current && !approved && "headline text-h2 font-medium")}
        >
          {visit.client}
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 text-small text-ink-700">
          {visit.kind === "Telehealth" && (
            <Video className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          )}
          {visit.service}, {visit.place}
        </div>
        {visit.note && !approved && (
          <p
            className={cn(
              "mt-1 text-small",
              current ? "text-ink-900" : "text-ink-500",
              done && "sr-only",
            )}
          >
            {visit.note}
          </p>
        )}
        {approved && (
          <div className="mt-1.5">
            <AiMark state="Approved">Note approved at 10:46 am</AiMark>
          </div>
        )}
      </div>
      <div className="col-start-2 mt-3 md:col-start-auto md:mt-0">
        {current && !approved && (
          <ButtonLink href="/design-preview/note" variant="primary">
            Write note with AI
          </ButtonLink>
        )}
        {approved && <ButtonLink href="/design-preview/prepared">See what AI prepared</ButtonLink>}
        {done && <Tag tone="healthy">Approved</Tag>}
        {visit.state === "next" && <Tag tone="neutral">Scheduled</Tag>}
      </div>
    </div>
  );
}

function Drive({ minutes, leaveBy }: { minutes: number; leaveBy?: string }) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 border-y border-border bg-surface-sunken px-5 py-1.5 md:grid-cols-[96px_minmax(0,1fr)]">
      <span />
      <span className="flex items-center gap-1.5 text-caption font-medium text-ink-500">
        <Car className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        {minutes} min drive{leaveBy && `, leave by ${leaveBy}`}
      </span>
    </div>
  );
}

function SideTasks() {
  const [done, setDone] = useState<string[]>([]);
  return (
    <Card aria-labelledby="my-tasks" className="overflow-hidden">
      <h2 id="my-tasks" className="px-5 pt-4.5 pb-3 headline text-h2">
        My tasks
      </h2>
      {sarahTasks.map((t) => {
        const isDone = done.includes(t.title);
        return (
          <div
            key={t.title}
            className="flex items-center justify-between gap-3 border-t border-border px-5 py-3"
          >
            <div className="min-w-0">
              <div
                className={cn("text-small font-semibold", isDone && "text-ink-500 line-through")}
              >
                {t.title}
              </div>
              <Caption>
                {t.client}, {t.due}
              </Caption>
            </div>
            {isDone ? (
              <Tag tone="healthy">Done</Tag>
            ) : (
              <Button size="sm" onClick={() => setDone([...done, t.title])}>
                Mark done
              </Button>
            )}
          </div>
        );
      })}
    </Card>
  );
}

export function MyDayView() {
  const [state] = usePreviewState<State>("finished");
  const notes = state === "approved" ? sarahNotesDue.slice(1) : sarahNotesDue;
  const empty = state === "empty";

  return (
    <>
      <PreviewBar href="/design-preview/my-day" />
      <Shell persona="sarah" active="My day" section="My work" page="My day">
        <ScreenTitle
          display
          title="Good morning, Sarah."
          description={
            <>
              {!empty && (
                <span className="mr-1.5 inline-flex items-center gap-1 align-text-bottom text-caption font-semibold text-brass">
                  <PenNib className="size-3.5 text-brass" />
                  AI day summary
                </span>
              )}
              {empty
                ? "No visits today. It's a good day to catch up on your notes."
                : state === "approved"
                  ? "Oliver's note is done. You have about 20 minutes before you leave for Isla's visit in Aspley."
                  : "Five visits today, about 50 minutes of driving. Oliver's note is the one to do now, while it's fresh."}
            </>
          }
        />

        <div className="grid items-start gap-6 xl:grid-cols-12">
          <Card aria-labelledby="today" className="overflow-hidden xl:col-span-8">
            <h2 id="today" className="sr-only">
              Today&apos;s visits
            </h2>
            {empty ? (
              <div className="px-5 py-10">
                <p className="headline text-h2">No visits booked today.</p>
                <p className="mt-1 text-small text-ink-700">
                  Your next visit is Wednesday at 8:30 am with Lucas Brennan in Stafford.
                </p>
                <ButtonLink href="/schedule" className="mt-4">
                  Open schedule
                </ButtonLink>
              </div>
            ) : (
              sarahDay.map((v, i) => (
                <Fragment key={v.id}>
                  {v.driveBefore > 0 ? (
                    <Drive
                      minutes={v.driveBefore}
                      leaveBy={v.state === "next" ? "11:10 am" : undefined}
                    />
                  ) : (
                    i > 0 && <div className="border-t border-border" />
                  )}
                  <VisitRow visit={v} state={state} />
                </Fragment>
              ))
            )}
          </Card>

          <div className="flex flex-col gap-6 xl:col-span-4">
            <Card aria-labelledby="notes-due" className="overflow-hidden">
              <h2 id="notes-due" className="px-5 pt-4.5 pb-3 headline text-h2">
                Notes still due
              </h2>
              {notes.map((n) => (
                <Link
                  key={n.client}
                  href="/design-preview/note"
                  className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 hover:bg-canvas hover:no-underline"
                >
                  <span className="min-w-0">
                    <span className="block text-small font-semibold text-ink-900">{n.client}</span>
                    <Caption>{n.detail}</Caption>
                  </span>
                  <Tag tone={n.status === "Overdue" ? "over" : "monitor"}>{n.status}</Tag>
                </Link>
              ))}
            </Card>

            <SideTasks />

            <Card aria-labelledby="next-supervision" className="px-5 pt-4.5 pb-4.5">
              <h2 id="next-supervision" className="headline text-h2">
                Next supervision
              </h2>
              <p className="mt-2 flex items-start gap-2 text-small">
                <UserCheck
                  className="mt-0.5 size-4 flex-none text-ink-500"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>Thursday 22 October, 2:00 pm, video call with Grace Liu</span>
              </p>
              <p className="mt-2 flex items-start gap-2 text-small text-ink-700">
                <Check
                  className="mt-0.5 size-4 flex-none text-ink-500"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>Grace has a brief ready. You&apos;ll see it before the session.</span>
              </p>
            </Card>
          </div>
        </div>
      </Shell>
    </>
  );
}
