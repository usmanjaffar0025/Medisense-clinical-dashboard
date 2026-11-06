"use client";

import { Car, Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { portalFamily } from "@/data/portal";
import { TODAY, scheduleDays, scheduleWith } from "@/data/schedule";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const ME = "Hannah Wright";
const MY_ID = "hannah-wright";

/** Hannah's week from the team schedule: sessions and driving per day. */
export function MyWeek() {
  const accepted = useDemoStore((s) =>
    Object.entries(s.suggestions)
      .filter(([, v]) => v === "accepted")
      .map(([id]) => id)
      .join(","),
  );
  const items = scheduleWith(accepted ? accepted.split(",") : []).filter(
    (i) => i.clinicianId === MY_ID && i.status !== "cancelled",
  );

  return (
    <Card aria-labelledby="my-week" className="mt-6 overflow-hidden">
      <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3">
        <h2 id="my-week" className="headline text-h2">
          My week
        </h2>
        <Link href="/schedule" className="text-small font-semibold">
          Open schedule
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-px border-t border-border bg-border">
        {scheduleDays.map((d) => {
          const day = items.filter((i) => i.day === d.id);
          const visits = day.filter((i) => i.type === "Home visit").length;
          const telehealth = day.filter((i) => i.type === "Telehealth").length;
          const driving = day.reduce((s, i) => s + i.travel, 0) / 60;
          return (
            <div
              key={d.id}
              className={cn(
                "flex flex-col gap-1 bg-surface px-4 py-3",
                d.id === TODAY && "bg-accent-tint",
              )}
            >
              <span className={cn("eyebrow", d.id === TODAY && "text-accent")}>
                {d.short}
                {d.id === TODAY && " · today"}
              </span>
              {day.length ? (
                <>
                  <span className="headline text-h2 font-normal">
                    {visits + telehealth} sessions
                  </span>
                  <Caption>
                    {visits} home · {telehealth} telehealth
                  </Caption>
                  <span className="flex items-center gap-1 text-caption text-ink-500">
                    <Car className="size-3" strokeWidth={1.5} aria-hidden="true" />
                    {driving.toFixed(1)} h driving
                  </span>
                </>
              ) : (
                <Caption>Not working (0.8 FTE)</Caption>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/** Open tasks owned by Hannah, including replies created by family portal messages. */
export function MyTasks() {
  const tasks = useDemoStore((s) => s.tasks);
  const complete = useDemoStore((s) => s.completeTask);
  const familyMessages = useDemoStore(
    (s) => s.portalMessages.length - portalFamily.messages.length,
  );
  const mine = tasks.filter((t) => t.owner === ME && !t.done);

  return (
    <Card aria-labelledby="my-tasks" className="overflow-hidden">
      <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3">
        <h2 id="my-tasks" className="headline text-h2">
          My tasks
        </h2>
        <Caption>{mine.length} open</Caption>
      </div>
      {familyMessages > 0 && (
        <Link
          href="/portal"
          className="flex items-center gap-2 border-t border-border bg-accent-tint px-5 py-2.5 text-small font-semibold text-accent hover:no-underline"
        >
          <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden="true" />
          New message from {portalFamily.viewer} (Emily&apos;s parent)
        </Link>
      )}
      {mine.length === 0 ? (
        <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-small text-healthy">
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          All done
        </p>
      ) : (
        mine.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 border-t border-border px-5 py-3"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold">{t.title}</div>
              <Caption>
                {t.client} · due {t.due}
              </Caption>
            </div>
            <Button size="sm" onClick={() => complete(t.id)}>
              Done
            </Button>
          </div>
        ))
      )}
    </Card>
  );
}
