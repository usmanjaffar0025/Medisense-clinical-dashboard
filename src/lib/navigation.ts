import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  ChartLine,
  ChartPie,
  ClipboardList,
  Contact,
  FileText,
  FileInput,
  ListChecks,
  ArrowLeftRight,
  Building2,
  Tablet,
  Video,
  Flag,
  History,
  Mic,
  Hospital,
  Receipt,
  FormInput,
  Inbox,
  Map as MapIcon,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type Role = "Leadership" | "Admin" | "Supervisor" | "Clinician";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** Roles that see this page in the sidebar. Pages stay reachable from links. */
  roles: Role[];
};

const L: Role = "Leadership";
const A: Role = "Admin";
const S: Role = "Supervisor";
const C: Role = "Clinician";

export const navigation: { group: string; items: NavItem[] }[] = [
  {
    group: "Organisation",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard, roles: [L] },
      { href: "/since-yesterday", label: "Since yesterday", icon: History, roles: [L] },
      { href: "/before-after", label: "Before and after", icon: ArrowLeftRight, roles: [L] },
      { href: "/team-capacity", label: "Team capacity", icon: Users, roles: [L, S] },
      { href: "/analytics", label: "AI insights", icon: ChartLine, roles: [L, S] },
      {
        href: "/clients-requiring-attention",
        label: "Clients to review",
        icon: Flag,
        badge: 14,
        roles: [L, A, S],
      },
    ],
  },
  {
    group: "Intake & Admin",
    items: [
      { href: "/admin-queue", label: "Work queue", icon: Inbox, roles: [L, A] },
      { href: "/intake", label: "AI referrals", icon: FileInput, badge: 7, roles: [L, A] },
      { href: "/forms", label: "AI forms", icon: FormInput, roles: [L, A] },
      { href: "/tasks", label: "Tasks", icon: ListChecks, roles: [L, A, S, C] },
      { href: "/admin-operations", label: "Admin Operations", icon: ShieldCheck, roles: [L, A] },
      { href: "/automations", label: "Automations", icon: Workflow, roles: [L] },
    ],
  },
  {
    group: "Clinical",
    items: [
      { href: "/my-day", label: "My day", icon: CalendarDays, roles: [C] },
      { href: "/sessions/oliver-grant", label: "AI session note", icon: Mic, roles: [C] },
      { href: "/clients", label: "Clients", icon: Contact, roles: [L, A, S, C] },
      { href: "/schedule", label: "Schedule", icon: CalendarClock, roles: [L, A, S, C] },
      { href: "/telehealth", label: "Telehealth", icon: Video, roles: [L, S, C] },
      { href: "/caseloads/sarah-thompson", label: "Caseloads", icon: Briefcase, roles: [L, S] },
      { href: "/supervision/sarah-thompson", label: "AI briefs", icon: UserCheck, roles: [L, S] },
    ],
  },
  {
    group: "AI workspace",
    items: [
      {
        href: "/case-notes/mia-robinson",
        label: "AI notes",
        icon: FileText,
        badge: 5,
        roles: [L, S, C],
      },
      { href: "/reports", label: "AI reports", icon: ClipboardList, roles: [L, A, S, C] },
      { href: "/admin-insights", label: "Admin insights", icon: ChartPie, roles: [L] },
    ],
  },
  {
    group: "Platform",
    items: [
      { href: "/portal", label: "Family Portal", icon: Smartphone, roles: [L, C] },
      { href: "/settings", label: "Security & Integrations", icon: Lock, roles: [L] },
      { href: "/roadmap", label: "Roadmap", icon: MapIcon, roles: [L] },
    ],
  },
  {
    group: "Mobile apps",
    items: [
      { href: "/mobile/staff", label: "Staff app", icon: Tablet, roles: [L, C] },
      { href: "/mobile/family", label: "Family app", icon: Smartphone, roles: [L, C] },
    ],
  },
  {
    group: "Business",
    items: [
      { href: "/billing", label: "Billing and claims", icon: Receipt, roles: [L, A] },
      { href: "/hospital", label: "Hospital operations", icon: Hospital, roles: [L] },
      { href: "/erp", label: "ERP", icon: Building2, roles: [L] },
    ],
  },
];

const roleLayouts: Partial<Record<Role, { group: string; hrefs: string[] }[]>> = {
  Clinician: [
    { group: "My work", hrefs: ["/my-day", "/sessions/oliver-grant", "/tasks"] },
    { group: "AI workspace", hrefs: ["/case-notes/mia-robinson", "/reports"] },
    { group: "Clinical", hrefs: ["/clients", "/schedule", "/telehealth"] },
    { group: "Platform", hrefs: ["/portal"] },
    { group: "Mobile apps", hrefs: ["/mobile/staff", "/mobile/family"] },
  ],
  Admin: [
    { group: "Admin", hrefs: ["/admin-queue", "/intake", "/forms", "/tasks", "/admin-operations"] },
    { group: "Clinical", hrefs: ["/clients-requiring-attention", "/clients", "/schedule"] },
    { group: "AI workspace", hrefs: ["/reports"] },
    { group: "Business", hrefs: ["/billing"] },
  ],
  Supervisor: [
    {
      group: "AI workspace",
      hrefs: ["/supervision/sarah-thompson", "/case-notes/mia-robinson", "/reports"],
    },
    {
      group: "Team",
      hrefs: [
        "/team-capacity",
        "/caseloads/sarah-thompson",
        "/analytics",
        "/clients-requiring-attention",
      ],
    },
    { group: "Clinical", hrefs: ["/clients", "/schedule", "/telehealth", "/tasks"] },
  ],
};

/** The sidebar for one role, with that person's main work first. */
export function navigationFor(role: Role) {
  const layout = roleLayouts[role];
  if (layout) {
    const items = navigation.flatMap((g) => g.items);
    return layout.map(({ group, hrefs }) => ({
      group,
      items: hrefs
        .map((href) => items.find((i) => i.href === href))
        .filter((i): i is NavItem => i !== undefined),
    }));
  }
  return navigation
    .map(({ group, items }) => ({ group, items: items.filter((i) => i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

/** Who the demo is signed in as in each role view. */
export const roleUsers: Record<Role, { name: string; initials: string; title: string }> = {
  Leadership: { name: "Neil Hensley", initials: "NH", title: "Director" },
  Admin: { name: "Jo Marsh", initials: "JM", title: "Administration" },
  Supervisor: { name: "Grace Liu", initials: "GL", title: "Senior OT & Clinical Supervisor" },
  Clinician: { name: "Sarah Thompson", initials: "ST", title: "Occupational Therapist" },
};

type RouteMeta = { section: string; page: string; role: Role };

const routes: { prefix: string; meta: RouteMeta }[] = [
  { prefix: "/sessions", meta: { section: "AI notes", page: "Oliver Grant", role: "Clinician" } },
  { prefix: "/admin-queue", meta: { section: "Admin", page: "Work queue", role: "Admin" } },
  {
    prefix: "/before-after",
    meta: { section: "Organisation", page: "Before and after", role: "Leadership" },
  },
  {
    prefix: "/since-yesterday",
    meta: { section: "Organisation", page: "Since yesterday", role: "Leadership" },
  },
  { prefix: "/telehealth", meta: { section: "Clinical", page: "Telehealth", role: "Clinician" } },
  { prefix: "/billing", meta: { section: "Business", page: "Billing and claims", role: "Admin" } },
  {
    prefix: "/hospital",
    meta: { section: "Business", page: "Hospital operations", role: "Leadership" },
  },
  { prefix: "/erp", meta: { section: "Business", page: "ERP", role: "Leadership" } },
  { prefix: "/roadmap", meta: { section: "Platform", page: "Roadmap", role: "Leadership" } },
  {
    prefix: "/intake",
    meta: { section: "Intake & Admin", page: "AI referrals", role: "Admin" },
  },
  { prefix: "/forms", meta: { section: "Intake & Admin", page: "AI forms", role: "Admin" } },
  { prefix: "/tasks", meta: { section: "Intake & Admin", page: "Tasks", role: "Admin" } },
  {
    prefix: "/admin-operations",
    meta: { section: "Intake & Admin", page: "Admin Operations", role: "Admin" },
  },
  {
    prefix: "/automations",
    meta: { section: "Intake & Admin", page: "Automations", role: "Leadership" },
  },
  { prefix: "/schedule", meta: { section: "Clinical", page: "Schedule", role: "Admin" } },
  { prefix: "/reports", meta: { section: "AI workspace", page: "AI reports", role: "Clinician" } },
  {
    prefix: "/analytics",
    meta: { section: "Organisation", page: "AI insights", role: "Leadership" },
  },
  { prefix: "/portal", meta: { section: "Platform", page: "Family Portal", role: "Leadership" } },
  {
    prefix: "/settings",
    meta: { section: "Platform", page: "Security & Integrations", role: "Leadership" },
  },
  {
    prefix: "/team-capacity",
    meta: { section: "Organisation", page: "Team capacity", role: "Leadership" },
  },
  {
    prefix: "/clients-requiring-attention",
    meta: { section: "Organisation", page: "Clients to review", role: "Leadership" },
  },
  {
    prefix: "/caseloads",
    meta: { section: "Clinical · Caseloads", page: "Sarah Thompson", role: "Leadership" },
  },
  {
    prefix: "/supervision",
    meta: { section: "AI briefs", page: "Sarah Thompson", role: "Supervisor" },
  },
  { prefix: "/my-day", meta: { section: "My work", page: "My day", role: "Clinician" } },
  {
    prefix: "/case-notes",
    meta: { section: "AI workspace", page: "AI notes", role: "Clinician" },
  },
  {
    prefix: "/progress-reports",
    meta: { section: "AI Workspace · Progress Reports", page: "Emily Carter", role: "Clinician" },
  },
  {
    prefix: "/admin-insights",
    meta: { section: "AI Workspace", page: "Admin Insights", role: "Leadership" },
  },
  // Last, so "/clients-requiring-attention" matches its own entry first.
  {
    prefix: "/clients/",
    meta: { section: "Clinical · Clients", page: "Client profile", role: "Clinician" },
  },
  { prefix: "/clients", meta: { section: "Clinical", page: "Clients", role: "Leadership" } },
];

const overview: RouteMeta = { section: "Organisation", page: "Overview", role: "Leadership" };

export function routeMeta(pathname: string): RouteMeta {
  return routes.find((r) => pathname.startsWith(r.prefix))?.meta ?? overview;
}

/** Screens that stand alone, without the staff sidebar and top bar. */
export function isStandalone(pathname: string) {
  return pathname.startsWith("/family") || pathname.startsWith("/mobile");
}

/** Detail pages that belong to a differently named sidebar entry. */
const activeAliases: Record<string, string[]> = { "/reports": ["/progress-reports"] };

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const section = href.split("/").slice(0, 2).join("/");
  return [section, ...(activeAliases[section] ?? [])].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const roleHome: Record<Role, string> = {
  Leadership: "/",
  Admin: "/admin-queue",
  Supervisor: "/supervision/sarah-thompson",
  Clinician: "/my-day",
};
