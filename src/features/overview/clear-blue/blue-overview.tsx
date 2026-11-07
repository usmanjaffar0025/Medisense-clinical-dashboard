"use client";

import {
  AlertTriangle,
  BellRing,
  Briefcase,
  CalendarClock,
  ChartLine,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileInput,
  FileText,
  Flag,
  ListChecks,
  MapPin,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Changed } from "@/components/ai/marks";
import { DonutChart } from "@/components/charts/donut-chart";
import { colour } from "@/components/charts/chart-kit";
import { Sparkline } from "@/components/charts/sparkline";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page";
import { AiMark } from "@/components/ai/marks";
import { caseNotes } from "@/data/case-note";
import { allScope, clinicianById } from "@/data/clinicians";
import { currentUser, organisation, summarise } from "@/data/organisation";
import { referrals } from "@/data/referrals";
import {
  formatTime,
  NOW,
  liveSchedule,
  TODAY as TODAY_COLUMN,
  type ScheduleItem,
} from "@/data/schedule";
import { weeks } from "@/data/weeks";
import { longDate } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { adjustClinician, unownedFollowUps } from "@/state/story-selectors";
import { useBriefing } from "../ai-briefing";
import { AssistantCard, MonthCalendar, Notifications, UpcomingSupervision } from "./blue-rail";

type Tone = "blue" | "amber" | "violet" | "green" | "red";

/** Icon tiles reuse the status and series tokens, so they follow the theme like everything else. */
const tiles: Record<Tone, string> = {
  blue: "bg-linear-to-br from-available-dot to-accent-fill-pressed",
  amber: "bg-linear-to-br from-monitor-dot to-monitor",
  violet: "bg-linear-to-br from-series-3 to-[color-mix(in_srgb,var(--color-series-3),black_22%)]",
  green: "bg-linear-to-br from-series-2 to-healthy",
  red: "bg-linear-to-br from-over-dot to-over",
};

function Tile({ icon: Icon, tone, large }: { icon: LucideIcon; tone: Tone; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex flex-none items-center justify-center rounded-full text-white shadow-hairline",
        large ? "size-11" : "size-9",
        tiles[tone],
      )}
    >
      <Icon className={large ? "size-5" : "size-4.5"} strokeWidth={1.75} />
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-w-0 flex-col rounded-card border border-border bg-surface p-5 surface-lift",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="headline text-section">{title}</h2>
        {action && (
          <Link href={action.href} className="text-caption font-medium whitespace-nowrap">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

const visitStatus: Record<ScheduleItem["status"], { label: string; pill: string; rule: string }> = {
  completed: { label: "Done", pill: "bg-healthy-bg text-healthy", rule: "bg-healthy-dot" },
  booked: { label: "Booked", pill: "bg-available-bg text-available", rule: "bg-available-dot" },
  cancelled: { label: "Cancelled", pill: "bg-over-bg text-over", rule: "bg-over-dot" },
};

export function VisitRow({ item }: { item: ScheduleItem }) {
  const status = visitStatus[item.status];
  return (
    <li className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="w-13 flex-none text-caption font-medium whitespace-nowrap text-ink-700">
        {formatTime(item.start)}
      </span>
      <i aria-hidden="true" className={cn("h-8 w-0.5 flex-none rounded-full", status.rule)} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-medium">{item.title}</span>
        <span className="block truncate text-caption text-ink-500">
          {clinicianById(item.clinicianId)?.name ?? item.type}
        </span>
      </span>
      <span
        className={cn(
          "flex-none rounded-tag px-1.5 py-0.5 text-eyebrow leading-4 font-semibold",
          status.pill,
        )}
      >
        {status.label}
      </span>
    </li>
  );
}

/** The director's greeting with the live AI briefing beside it. */
function Hero() {
  const { briefing, changed, lastSkip } = useBriefing();
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const [place] = organisation.location.split(" · ");

  return (
    <section
      aria-label="Welcome"
      className="page-hero relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:grid-cols-[minmax(0,1fr)_180px_minmax(0,420px)]"
    >
      <div className="relative min-w-0">
        <p className="headline text-h2 font-medium">Good morning,</p>
        <h1 className="mt-0.5 headline text-accent">{currentUser.firstName}!</h1>
        <p className="mt-3 text-small text-ink-700">
          Here&apos;s what&apos;s happening across your team today.
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-caption">
          <div className="flex items-center gap-2">
            <Clock className="size-5 flex-none text-accent" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <dt className="sr-only">Today</dt>
              <dd className="font-semibold">{formatTime(NOW)}</dd>
              <dd className="text-ink-500">{longDate(dayOffset)}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 flex-none text-accent" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <dt className="sr-only">Service</dt>
              <dd className="font-semibold">{organisation.name}</dd>
              <dd className="text-ink-500">{place}</dd>
            </div>
          </div>
        </dl>
      </div>

      <HeroArt />

      <div className="on-light relative flex min-w-0 flex-col rounded-card border border-border bg-surface p-4 text-ink-900 surface-lift">
        <AiMark>AI briefing, recommendation only</AiMark>
        {briefing.loading ? (
          <div aria-busy="true" className="mt-3 flex-1">
            <span className="block h-3 w-11/12 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
            <span className="mt-2 block h-3 w-3/4 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
            <span className="mt-2 block h-3 w-5/6 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
          </div>
        ) : (
          <p className="mt-2 flex-1 text-small leading-5.5">{briefing.data}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {changed ? (
            <>
              <ButtonLink href="/before-after" variant="primary" size="sm">
                See before and after
              </ButtonLink>
              {lastSkip > 0 && (
                <ButtonLink href="/since-yesterday" size="sm">
                  See what happened overnight
                </ButtonLink>
              )}
            </>
          ) : (
            <ButtonLink href="/caseloads/sarah-thompson" variant="primary" size="sm">
              See Sarah&apos;s workload
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}

/** A quiet care-themed drawing; swap it for a commissioned illustration when one exists. */
function HeroArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 180"
      className="pointer-events-none hidden w-full xl:block"
    >
      <rect
        x="44"
        y="26"
        width="150"
        height="112"
        rx="16"
        fill="#ffffff"
        fillOpacity="0.14"
        stroke="#ffffff"
        strokeOpacity="0.4"
      />
      <path
        d="M60 84h26l10-26 18 52 13-26h50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="60" y="116" width="74" height="6" rx="3" fill="#ffffff" fillOpacity="0.5" />
      <rect x="60" y="42" width="44" height="6" rx="3" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="194" cy="34" r="22" fill="#2ed5c5" />
      <path d="M194 46c-6-5-12-9-12-15 0-7 9-9 12-3 3-6 12-4 12 3 0 6-6 10-12 15Z" fill="#ffffff" />
      <rect x="10" y="108" width="62" height="46" rx="12" fill="#ffffff" />
      <rect x="20" y="136" width="8" height="10" rx="2" fill="#2e90fa" />
      <rect x="33" y="126" width="8" height="20" rx="2" fill="#0e9f8e" />
      <rect x="46" y="118" width="8" height="28" rx="2" fill="#7a5af8" />
    </svg>
  );
}

const kpiCards: {
  label: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  href: string;
}[] = [
  { label: "Active clients", title: "Active clients", icon: Users, tone: "blue", href: "/clients" },
  {
    label: "Notes due",
    title: "Notes due",
    icon: FileText,
    tone: "amber",
    href: "/case-notes/mia-robinson",
  },
  {
    label: "Follow-ups overdue",
    title: "Follow-ups overdue",
    icon: ClipboardCheck,
    tone: "violet",
    href: "/tasks",
  },
  {
    label: "Supervision due",
    title: "Supervision due",
    icon: UserCheck,
    tone: "green",
    href: "/supervision/sarah-thompson",
  },
  {
    label: "Clients requiring review",
    title: "Clients to review",
    icon: Flag,
    tone: "red",
    href: "/clients-requiring-attention",
  },
];

function useFigures() {
  const notes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const story = useDemoStore((s) => s.story);
  const live = summarise(allScope, adjustClinician({ caseNotes: notes, tasks, story }));
  const base = summarise(allScope);
  return { live, base, story, tasks };
}

function KpiRow() {
  const { live, base, story } = useFigures();
  const count = (priority: string) => live.attention.filter((a) => a.priority === priority).length;
  const supervision = live.list.filter((c) => c.supervisionDue).length;
  const spark = (values: number[], tone: string, unit: string) => (
    <Sparkline values={values} labels={weeks} colour={tone} height={34} unit={unit} />
  );
  const visuals: Record<string, ReactNode> = {
    "Active clients": spark(live.series.active, colour.series1, "active clients"),
    "Notes due": spark(live.series.notesDue, colour.monitor, "notes due"),
    "Follow-ups overdue": spark(live.series.followUps, colour.series3, "follow-ups overdue"),
    "Supervision due": (
      <span
        role="img"
        aria-label={`${supervision} of ${live.list.length} clinicians`}
        className="flex h-8.5 items-center"
      >
        <span className="relative block h-2 w-full overflow-hidden rounded-full bg-canvas">
          <i
            className="absolute inset-y-0 left-0 rounded-full bg-series-2"
            style={{ width: `${(supervision / Math.max(live.list.length, 1)) * 100}%` }}
          />
        </span>
      </span>
    ),
    "Clients requiring review": (
      <span
        role="img"
        aria-label={`${count("High")} high, ${count("Medium")} medium, ${count("Review")} review`}
        className="flex h-8.5 items-center gap-0.5"
      >
        <i className="h-2 rounded-full bg-over-dot" style={{ flexGrow: count("High") }} />
        <i className="h-2 rounded-full bg-monitor-dot" style={{ flexGrow: count("Medium") }} />
        <i className="h-2 rounded-full bg-border-strong" style={{ flexGrow: count("Review") }} />
      </span>
    ),
  };
  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-6 lg:grid-cols-5">
      {kpiCards.map((card) => {
        const kpi = live.kpis.find((k) => k.label === card.label);
        const was = base.kpis.find((k) => k.label === card.label)?.value;
        if (!kpi) return null;
        const caption =
          card.label === "Follow-ups overdue" ? `${unownedFollowUps(story)} no owner` : kpi.caption;
        return (
          <Link
            key={card.label}
            href={card.href}
            className="flex min-w-0 flex-col gap-2 rounded-card border border-border bg-surface p-5 text-ink-900 surface-lift last:col-span-2 hover:border-border-strong hover:text-ink-900 hover:no-underline lg:last:col-span-1"
          >
            <span className="flex items-center gap-2.5">
              <Tile icon={card.icon} tone={card.tone} />
              <span className="min-w-0 text-caption leading-4 font-medium text-ink-700">
                {card.title}
              </span>
            </span>
            <span className="headline text-[32px] leading-9">
              <Changed value={kpi.value} was={was !== kpi.value ? was : undefined} />
            </span>
            <span className="line-clamp-2 min-h-8 text-caption text-ink-500">{caption}</span>
            <span className="mt-auto block">{visuals[card.label]}</span>
          </Link>
        );
      })}
    </section>
  );
}

function useTodaysVisits() {
  const suggestions = useDemoStore((s) => s.suggestions);
  const accepted = Object.entries(suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  const bookings = useDemoStore((s) => s.bookings);
  const changes = useDemoStore((s) => s.visitChanges);
  const items = liveSchedule(accepted, bookings, changes);
  return items
    .filter((i) => i.day === TODAY_COLUMN && (i.type === "Home visit" || i.type === "Telehealth"))
    .sort((a, b) => a.start - b.start);
}

/** One visit per start time first, then the rest, so a short list shows the shape of the day. */
function spread(visits: ScheduleItem[], count: number) {
  const seen = new Set<number>();
  const first = visits.filter((v) => {
    if (seen.has(v.start)) return false;
    seen.add(v.start);
    return true;
  });
  const rest = visits.filter((v) => !first.includes(v));
  return [...first, ...rest].slice(0, count).sort((a, b) => a.start - b.start);
}

function TodaysVisits({ className }: { className?: string }) {
  const visits = useTodaysVisits();
  const from = Math.max(
    0,
    visits.findIndex((v) => v.start >= NOW - 45),
  );
  return (
    <Panel
      className={className}
      title="Today's visits"
      action={{ href: "/schedule", label: "View all" }}
    >
      <ul className="flex-1 divide-y divide-border">
        {spread(visits.slice(from), 5).map((v) => (
          <VisitRow key={v.id} item={v} />
        ))}
      </ul>
      <p className="mt-2 border-t border-border pt-2 text-caption text-ink-500">
        {visits.length} visits across the team today
      </p>
    </Panel>
  );
}

const quickLinks: { href: string; label: string; icon: LucideIcon; tone: Tone }[] = [
  { href: "/clients", label: "Clients", icon: Users, tone: "blue" },
  { href: "/schedule", label: "Schedule", icon: CalendarClock, tone: "blue" },
  { href: "/team-capacity", label: "Team capacity", icon: Briefcase, tone: "green" },
  { href: "/tasks", label: "Tasks", icon: ListChecks, tone: "amber" },
  { href: "/reports", label: "AI reports", icon: ClipboardList, tone: "violet" },
  { href: "/analytics", label: "AI insights", icon: ChartLine, tone: "violet" },
  { href: "/intake", label: "AI referrals", icon: FileInput, tone: "blue" },
];

function QuickLinks() {
  return (
    <nav aria-label="Quick links" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {quickLinks.map((q) => (
        <Link
          key={q.href}
          href={q.href}
          className="flex min-w-0 items-center gap-2.5 rounded-control border border-border bg-surface px-3 py-2.5 text-small leading-4 font-semibold text-ink-900 surface-lift hover:text-ink-900 hover:no-underline"
        >
          <Tile icon={q.icon} tone={q.tone} />
          <span className="min-w-0">{q.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function TeamStatus({ className }: { className?: string }) {
  const { live } = useFigures();
  const count = (status: string) => live.list.filter((c) => c.status === status).length;
  const utilisation = live.capacity ? Math.round((live.active / live.capacity) * 100) : 0;
  const highest = Math.max(...live.list.map((c) => c.utilisation));
  return (
    <Panel
      className={className}
      title="Team status"
      action={{ href: "/team-capacity", label: "View all" }}
    >
      <DonutChart
        label="Clinicians by caseload status"
        stacked
        size={132}
        centre={live.list.length}
        centreCaption="Clinicians"
        slices={[
          { id: "healthy", label: "Healthy", value: count("healthy"), colour: colour.healthy },
          { id: "monitor", label: "Watch", value: count("monitor"), colour: colour.monitor },
          { id: "at-risk", label: "At Risk", value: count("at-risk"), colour: colour.over },
        ]}
      />
      <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <dt className="text-caption text-ink-500">Team utilisation</dt>
          <dd className="headline text-figure">{utilisation}%</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-500">Peak caseload</dt>
          <dd className="headline text-figure">{highest}%</dd>
        </div>
      </dl>
    </Panel>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-tint text-caption font-semibold text-accent"
    >
      {initials(name)}
    </span>
  );
}

function RecentNotes({ className }: { className?: string }) {
  const states = useDemoStore((s) => s.caseNotes);
  return (
    <Panel
      className={className}
      title="Recent AI notes"
      action={{ href: "/case-notes/mia-robinson", label: "View all" }}
    >
      <ul className="flex flex-1 flex-col justify-between gap-3">
        {caseNotes.slice(0, 4).map((n) => (
          <li key={n.id}>
            <Link
              href={`/case-notes/${n.id}`}
              className="flex gap-2.5 text-ink-900 hover:text-ink-900 hover:no-underline"
            >
              <Avatar name={n.client} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-small font-medium">{n.client}</span>
                <span className="line-clamp-2 text-caption text-ink-500">
                  {states[n.id]?.mode === "approved"
                    ? "Note approved."
                    : n.backlog.kind === "ai-draft"
                      ? "AI draft ready for approval."
                      : `Note ${n.backlog.days} days overdue.`}{" "}
                  {n.clinician}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ReviewAlerts({ className }: { className?: string }) {
  const { live } = useFigures();
  const shown = [
    ...live.attention.filter((a) => a.priority === "High"),
    ...live.attention.filter((a) => a.priority === "Medium"),
  ].slice(0, 3);
  return (
    <Panel
      className={className}
      title="Clients to review"
      action={{ href: "/clients-requiring-attention", label: "View all" }}
    >
      <ul className="flex flex-1 flex-col gap-2">
        {shown.map((a) => {
          const high = a.priority === "High";
          return (
            <li
              key={a.id}
              className={cn(
                "flex gap-2 rounded-control px-2.5 py-2",
                high ? "bg-over-bg" : "bg-monitor-bg",
              )}
            >
              <AlertTriangle
                className={cn("mt-0.5 size-4 flex-none", high ? "text-over" : "text-monitor")}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-caption font-semibold",
                    high ? "text-over" : "text-monitor",
                  )}
                >
                  {a.priority} priority
                </span>
                <span className="block truncate text-small font-medium">{a.name}</span>
                <span className="line-clamp-1 text-caption text-ink-700">{a.reason}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/** These come from rules, not AI, so the panel isn't labelled AI. */
function Reminders({ className }: { className?: string }) {
  const { live, story, tasks } = useFigures();
  const kpi = (label: string) => live.kpis.find((k) => k.label === label)?.value ?? "0";
  const escalated = tasks.filter((t) => !t.done && t.daysOverdue >= 3).length;
  const rows: { icon: LucideIcon; text: string; href: string; action: string }[] = [
    {
      icon: ClipboardCheck,
      text: `${unownedFollowUps(story)} follow-ups with no owner`,
      href: "/tasks",
      action: "Assign",
    },
    {
      icon: FileText,
      text: `${kpi("Notes due")} notes due`,
      href: "/case-notes/mia-robinson",
      action: "Review",
    },
    {
      icon: UserCheck,
      text: `${kpi("Supervision due")} supervision sessions due`,
      href: "/supervision/sarah-thompson",
      action: "View",
    },
    { icon: BellRing, text: `${escalated} tasks overdue`, href: "/tasks", action: "View" },
    {
      icon: FileInput,
      text: `${referrals.length} referrals in progress`,
      href: "/intake",
      action: "Open",
    },
  ];
  return (
    <Panel className={className} title="Automated reminders">
      <ul className="flex flex-1 flex-col justify-between gap-2.5">
        {rows.map((r) => (
          <li key={r.text} className="flex items-center gap-2 text-caption">
            <r.icon className="size-4 flex-none text-accent" strokeWidth={1.5} aria-hidden="true" />
            <span className="min-w-0 flex-1 leading-4">{r.text}</span>
            <Link href={r.href} className="flex-none font-medium">
              {r.action}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const ROW = "grid gap-6 md:grid-cols-2 xl:grid-cols-12";
const THIRD = "xl:col-span-4";
const LAST_THIRD = "md:col-span-2 xl:col-span-4";

/** One 12-column grid with one 24 px gap, so every row lines up across the page. */
export function BlueOverview({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <Hero />
        <KpiRow />
        <QuickLinks />
        <div className={ROW}>
          <TodaysVisits className="xl:col-span-5" />
          <TeamStatus className="xl:col-span-4" />
          <MonthCalendar className="md:col-span-2 xl:col-span-3" />
        </div>
        <div className={ROW}>
          <ReviewAlerts className={THIRD} />
          <RecentNotes className={THIRD} />
          <Reminders className={LAST_THIRD} />
        </div>
        <div className={ROW}>
          <UpcomingSupervision className={THIRD} />
          <Notifications className={THIRD} />
          <AssistantCard className={LAST_THIRD} />
        </div>
      </div>

      <section aria-labelledby="team-detail" className="mt-12">
        <h2 id="team-detail" className="mb-5 headline text-h1">
          Team detail
        </h2>
        {children}
      </section>
    </PageContainer>
  );
}
