"use client";

import { dt } from "@/lib/clock";
import {
  CalendarDays,
  CircleAlert,
  ClipboardList,
  FileText,
  FormInput,
  ListChecks,
  MessageSquare,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApprovedLabel, DraftLabel, draftSurface } from "@/components/ai/provenance";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { TrendChart } from "@/components/charts/trend-chart";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  goalMonths,
  type ClientProfile,
  type GoalStatus,
  type TimelineKind,
} from "@/data/client-profiles";
import { cn } from "@/lib/cn";

const goalTone: Record<GoalStatus, TagTone> = {
  Achieved: "healthy",
  "On track": "healthy",
  Progressing: "available",
  "At risk": "over",
};

const goalColours = [colour.series1, colour.series2, colour.series3];

const timelineIcon: Record<TimelineKind, LucideIcon> = {
  note: FileText,
  report: ClipboardList,
  task: ListChecks,
  referral: UserPlus,
  contact: MessageSquare,
  form: FormInput,
  visit: CalendarDays,
};

const documentTone = {
  Current: "healthy",
  Expiring: "monitor",
  Draft: "live",
  Missing: "over",
} as const;

const money = (v: number) => `$${v.toLocaleString("en-AU")}`;

export function ClientProfileView({ profile }: { profile: ClientProfile }) {
  const [reviewed, setReviewed] = useState(false);
  const attended = profile.attendance.reduce((s, m) => s + m.attended, 0);
  const booked = profile.attendance.reduce((s, m) => s + m.attended + m.cancelled, 0);
  const attendanceRate = booked ? Math.round((attended / booked) * 100) : 0;
  const used = Math.round((profile.budget.spent / profile.budget.total) * 100);
  const onTrack = profile.goals.filter((g) => g.status === "On track" || g.status === "Achieved");
  const atRisk = profile.goals.filter((g) => g.status === "At risk");

  const metrics = [
    {
      label: "Plan review",
      value: `${profile.plan.daysToReview} days`,
      caption: profile.plan.review,
      over: profile.plan.daysToReview <= 30,
    },
    {
      label: "Goals on track",
      value: `${onTrack.length} of ${profile.goals.length}`,
      caption: atRisk.length ? `${atRisk.length} at risk` : "None at risk",
      over: atRisk.length > 0,
    },
    {
      label: "Attendance",
      value: `${attendanceRate}%`,
      caption: `${attended} of ${booked} sessions · 6 months`,
      over: attendanceRate < 80,
    },
    {
      label: "Budget used",
      value: `${used}%`,
      caption: `${money(profile.budget.spent)} of ${money(profile.budget.total)}`,
    },
    {
      label: "Next appointment",
      value: profile.nextAppointment.split(" · ")[0] ?? "",
      caption: profile.nextAppointment.split(" · ")[1] ?? "",
      small: true,
    },
  ];

  const goalTrend = goalMonths.map((month, i) => ({
    month,
    ...Object.fromEntries(profile.goals.map((g) => [g.id, g.history[i] ?? 0])),
  }));

  return (
    <>
      {profile.alerts.length > 0 && (
        <section aria-label="Alerts" className="mb-6 flex flex-col gap-2">
          {profile.alerts.map((a) => (
            <div
              key={a.text}
              className={cn(
                "flex items-center gap-2.5 rounded-card border px-4 py-2.5 text-small",
                a.tone === "over" && "border-over/30 bg-over-bg text-over",
                a.tone === "monitor" && "border-monitor/30 bg-monitor-bg text-monitor",
                a.tone === "neutral" && "border-border bg-surface text-ink-700",
              )}
            >
              <CircleAlert className="size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-semibold">{a.text}</span>
            </div>
          ))}
        </section>
      )}

      <section
        aria-label="Client summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span
              className={cn(
                "headline font-normal",
                m.small ? "text-h2" : "text-stat",
                m.over && "text-over",
              )}
            >
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <div className={cn(draftSurface(reviewed), "flex flex-col gap-3 px-5 py-5 lg:col-span-5")}>
          {reviewed ? (
            <ApprovedLabel meta="Reviewed by clinician">Client summary</ApprovedLabel>
          ) : (
            <DraftLabel meta="From approved notes, goals and plan">
              AI summary — check before relying on it
            </DraftLabel>
          )}
          <p className="text-body text-ink-900">{profile.summary}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <Caption>Updated {dt("20 Oct 2026")}, 7:00 am</Caption>
            {!reviewed && (
              <Button size="sm" onClick={() => setReviewed(true)}>
                Mark as reviewed
              </Button>
            )}
          </div>
          <div className="border-t border-border pt-3">
            <div className="mb-1.5 eyebrow">Contacts</div>
            <ul className="flex flex-col">
              {profile.contacts.map((c) => (
                <li
                  key={c.name}
                  className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 py-1 text-small"
                >
                  <span className="text-ink-500">{c.role}</span>
                  <span>
                    <b className="font-semibold">{c.name}</b>
                    <span className="text-ink-500"> · {c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Card aria-labelledby="goal-trend" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle
            id="goal-trend"
            title="Goal progress"
            description="Percent of the way from baseline to target · last six months"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Goal progress over six months"
              height="fill"
              data={goalTrend}
              xKey="month"
              domain={[0, 100]}
              format={(v) => `${v}%`}
              series={profile.goals.map((g, i) => ({
                key: g.id,
                label: g.domain,
                colour: goalColours[i] ?? colour.series4,
              }))}
            />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="goals" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle id="goals" title="Goals" description={profile.plan.label} />
        </div>
        {profile.goals.map((g, i) => (
          <div
            key={g.id}
            className="grid items-center gap-x-6 gap-y-2 border-t border-border px-5 py-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(180px,1fr)_104px]"
          >
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2.5 flex-none rounded-xs"
                style={{ backgroundColor: goalColours[i] ?? colour.series4 }}
              />
              <div>
                <div className="font-semibold">{g.text}</div>
                <Caption>
                  {g.domain} · {g.measure}
                </Caption>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-small">
              <span>
                <span className="block eyebrow">Baseline</span>
                {g.baseline}
              </span>
              <span>
                <span className="block eyebrow">Now</span>
                <b className="font-semibold">{g.current}</b>
              </span>
              <span>
                <span className="block eyebrow">Target</span>
                {g.target}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-1.5 flex-1 rounded-full bg-surface-sunken">
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${g.progress}%`,
                    backgroundColor: goalColours[i] ?? colour.series4,
                  }}
                />
              </div>
              <span className="w-9 text-right text-small">{g.progress}%</span>
            </div>
            <div className="lg:text-right">
              <Tag tone={goalTone[g.status]}>{g.status}</Tag>
            </div>
          </div>
        ))}
      </Card>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="budget" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle id="budget" title="Funding used" description={profile.budget.label} />
          <div className="mt-3 flex flex-1 flex-col">
            <TrendChart
              label="Cumulative spend against an even spread"
              height="fill"
              data={profile.budget.months}
              xKey="month"
              format={money}
              series={[
                { key: "spent", label: "Spent", colour: colour.series1, kind: "area" },
                { key: "expected", label: "Even spread", colour: colour.series4 },
              ]}
            />
          </div>
          <Caption className="mt-2">{profile.budget.insight}</Caption>
        </Card>

        <Card aria-labelledby="attendance" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="attendance"
            title="Attendance"
            description={`${attendanceRate}% of booked sessions attended · May → Oct`}
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Sessions attended and cancelled by month"
              height="fill"
              data={profile.attendance}
              xKey="month"
              series={[
                { key: "attended", label: "Attended", colour: colour.series1 },
                { key: "cancelled", label: "Cancelled", colour: colour.over },
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="timeline" className="flex flex-col lg:col-span-7">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="timeline"
              title="Timeline"
              description="Visits, notes, reports and contact"
            />
          </div>
          <ol className="flex flex-col">
            {profile.timeline.map((e) => {
              const Icon = timelineIcon[e.kind];
              const body = (
                <>
                  <span className="w-14 flex-none pt-0.5 text-caption font-semibold text-ink-500">
                    {e.date}
                  </span>
                  <Icon
                    className="mt-0.5 size-4 flex-none text-ink-500"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-small font-semibold",
                        e.href && "group-hover:text-accent",
                      )}
                    >
                      {e.title}
                    </span>
                    <Caption>{e.detail}</Caption>
                  </span>
                </>
              );
              return (
                <li key={`${e.date}-${e.title}`} className="border-t border-border">
                  {e.href ? (
                    <Link
                      href={e.href}
                      className="group flex items-start gap-3 px-5 py-2.5 hover:bg-canvas hover:no-underline"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-5 py-2.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>

        <Card aria-labelledby="documents" className="flex flex-col lg:col-span-5">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="documents"
              title="Documents"
              description="Plans, agreements, consents and reports"
            />
          </div>
          {profile.documents.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-small font-semibold">{d.name}</div>
                <Caption>
                  {d.kind} · {d.date}
                </Caption>
              </div>
              <Tag tone={documentTone[d.status]}>{d.status}</Tag>
            </div>
          ))}
          <Caption className="mt-auto border-t border-border px-5 py-3">
            Documents stay in your practice management system; Medisense tracks dates and gaps.
          </Caption>
        </Card>
      </div>
    </>
  );
}
