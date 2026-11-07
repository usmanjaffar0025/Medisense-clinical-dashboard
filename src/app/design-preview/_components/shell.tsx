import {
  Bell,
  Briefcase,
  CalendarClock,
  CalendarDays,
  ChartLine,
  ClipboardList,
  Contact,
  FileText,
  Flag,
  History,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Map,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PenNib } from "@/components/ai/provenance";
import { cn } from "@/lib/cn";
import { darkSurfaceFocus } from "./proposed-tokens";

export type Persona = "neil" | "sarah" | "jo" | "grace";

type NavItem = { label: string; icon: LucideIcon; href?: string };

const people: Record<
  Persona,
  { name: string; initials: string; title: string; nav: { group: string; items: NavItem[] }[] }
> = {
  neil: {
    name: "Neil Hensley",
    initials: "NH",
    title: "Director",
    nav: [
      {
        group: "Organisation",
        items: [
          { label: "Overview", icon: LayoutDashboard, href: "/design-preview/overview" },
          { label: "Team capacity", icon: Users },
          { label: "AI insights", icon: ChartLine },
          { label: "Clients to review", icon: Flag },
          { label: "Roadmap", icon: Map, href: "/design-preview/roadmap" },
        ],
      },
      {
        group: "Clinical",
        items: [
          { label: "Caseloads", icon: Briefcase },
          { label: "Supervision", icon: UserCheck, href: "/design-preview/supervision" },
        ],
      },
    ],
  },
  sarah: {
    name: "Sarah Thompson",
    initials: "ST",
    title: "Occupational Therapist",
    nav: [
      {
        group: "My work",
        items: [
          { label: "My day", icon: CalendarDays, href: "/design-preview/my-day" },
          { label: "My tasks", icon: ListChecks },
        ],
      },
      {
        group: "AI workspace",
        items: [
          { label: "AI notes", icon: FileText, href: "/design-preview/note" },
          { label: "AI reports", icon: ClipboardList },
        ],
      },
      {
        group: "Clinical",
        items: [
          { label: "Clients", icon: Contact },
          { label: "Schedule", icon: CalendarClock },
          { label: "Supervision", icon: UserCheck },
        ],
      },
    ],
  },
  jo: {
    name: "Jo Marsh",
    initials: "JM",
    title: "Administration",
    nav: [
      {
        group: "Admin",
        items: [
          { label: "Work queue", icon: Inbox, href: "/design-preview/admin-queue" },
          { label: "AI referrals", icon: FileText },
          { label: "AI forms", icon: ClipboardList },
          { label: "Schedule", icon: CalendarClock },
        ],
      },
    ],
  },
  grace: {
    name: "Grace Liu",
    initials: "GL",
    title: "Senior OT and Clinical Supervisor",
    nav: [
      {
        group: "AI workspace",
        items: [
          { label: "AI briefs", icon: UserCheck, href: "/design-preview/supervision" },
          { label: "Caseloads", icon: Briefcase },
          { label: "Team capacity", icon: Users },
          { label: "Escalations", icon: Flag },
        ],
      },
    ],
  },
};

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const classes = cn(
    "flex h-9 items-center justify-center gap-2.5 rounded-r-control px-3 text-body hover:no-underline xl:justify-start",
    active
      ? "bg-sidebar-hover font-semibold text-accent-fill shadow-rule-accent"
      : "font-medium text-sidebar-muted",
    item.href && !active && "hover:bg-sidebar-hover hover:text-sidebar-ink",
  );
  const content = (
    <>
      <Icon
        className={cn("size-5 flex-none", active ? "text-accent-fill" : "text-sidebar-faint")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="hidden flex-1 truncate xl:block">{item.label}</span>
    </>
  );
  // Items outside this phase stay visible for context but can't be followed.
  return item.href ? (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={classes}
    >
      {content}
    </Link>
  ) : (
    <span title={item.label} className={classes}>
      {content}
    </span>
  );
}

/** The proposed product shell: icon rail below 1280 px, removed below 768 px. */
export function Shell({
  persona,
  active,
  section,
  page,
  date = "Tuesday 20 October 2026",
  bellCount = 0,
  children,
}: {
  persona: Persona;
  active: string;
  section: string;
  page: string;
  date?: string;
  bellCount?: number;
  children: ReactNode;
}) {
  const person = people[persona];
  return (
    <div className="flex min-h-0 flex-1 bg-canvas">
      <nav
        aria-label="Primary"
        style={darkSurfaceFocus}
        className="hidden h-full w-16 flex-none flex-col gap-5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-2 pt-5 pb-4 md:flex xl:w-sidebar xl:px-3"
      >
        <Link
          href="/design-preview"
          aria-label="Medisense"
          className="flex flex-col px-1 pt-1 text-center text-sidebar-ink hover:text-sidebar-ink hover:no-underline xl:px-3 xl:text-left"
        >
          <span className="headline text-h2 leading-6 xl:hidden">M</span>
          <span className="hidden headline text-h2 leading-6 xl:block">Medisense</span>
          <span className="mt-0.5 hidden text-caption font-medium text-sidebar-muted xl:block">
            Clinical Operations &amp; Supervision
          </span>
        </Link>
        {person.nav.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-0.5">
            <div className="hidden px-3 pb-1.5 text-caption font-medium text-sidebar-faint xl:block">
              {group}
            </div>
            {items.map((item) => (
              <NavRow key={item.label} item={item} active={item.label === active} />
            ))}
          </div>
        ))}
        <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-sidebar-border px-1 pt-4 xl:justify-start xl:px-3">
          <span
            aria-hidden="true"
            className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-fill text-caption font-semibold text-on-accent"
          >
            {person.initials}
          </span>
          <span className="hidden min-w-0 flex-col xl:flex">
            <span className="text-small font-semibold text-sidebar-ink">{person.name}</span>
            <span className="text-caption font-medium text-sidebar-muted">{person.title}</span>
          </span>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto" data-scroll>
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border bg-canvas px-4 py-3 md:px-6 xl:px-10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-small">
              <span className="text-ink-500">{section}</span>
              <span aria-hidden="true" className="text-ink-400">
                /
              </span>
              <span className="font-semibold text-ink-900" aria-current="page">
                {page}
              </span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden h-9 w-72 items-center gap-2 rounded-control border border-border bg-surface pr-1 pl-2.5 lg:flex">
                <PenNib className="text-brass" />
                <span className="flex-1 text-small text-ink-500">Ask Medisense AI</span>
                <span className="flex h-7 items-center rounded-tag bg-accent-fill px-2 text-caption font-semibold text-on-accent">
                  Ask
                </span>
              </div>
              <button
                type="button"
                aria-label={bellCount ? `${bellCount} new notifications` : "Notifications"}
                className="relative flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
              >
                <Bell className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
                {bellCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-over-dot text-eyebrow font-semibold text-surface-raised"
                  >
                    {bellCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label="Open audit trail"
                className="flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
              >
                <History className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <span className="hidden text-small whitespace-nowrap text-ink-700 lg:inline">
                {date}
              </span>
            </div>
          </header>
          <main className="w-full px-4 pt-6 pb-18 md:px-6 md:pt-8 xl:px-10">{children}</main>
        </div>
        <nav
          aria-label="Primary, phone"
          style={darkSurfaceFocus}
          className="grid h-16 flex-none grid-cols-4 bg-sidebar md:hidden"
        >
          {person.nav
            .flatMap((g) => g.items)
            .slice(0, 4)
            .map((item) => {
              const Icon = item.icon;
              const on = item.label === active;
              const classes = cn(
                "flex flex-col items-center justify-center gap-1 text-caption font-medium hover:no-underline",
                on ? "text-accent-fill" : "text-sidebar-muted",
              );
              const body = (
                <>
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  {item.label}
                </>
              );
              return item.href ? (
                <Link key={item.label} href={item.href} className={classes}>
                  {body}
                </Link>
              ) : (
                <span key={item.label} className={classes}>
                  {body}
                </span>
              );
            })}
        </nav>
      </div>
    </div>
  );
}

/** A page title without the uppercase eyebrow, which the brief retires on these screens. */
export function ScreenTitle({
  title,
  description,
  actions,
  display = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  display?: boolean;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-180">
        <h1 className={cn("headline", display ? "text-display" : "text-h1")}>{title}</h1>
        {description && <p className="mt-1.5 text-body text-ink-700">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
