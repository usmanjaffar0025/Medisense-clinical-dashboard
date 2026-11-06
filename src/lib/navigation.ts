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
  Flag,
  FormInput,
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
      { href: "/team-capacity", label: "Team Capacity", icon: Users, roles: [L, S] },
      { href: "/analytics", label: "Analytics", icon: ChartLine, roles: [L, S] },
      {
        href: "/clients-requiring-attention",
        label: "Clients Requiring Attention",
        icon: Flag,
        badge: 14,
        roles: [L, A, S],
      },
    ],
  },
  {
    group: "Intake & Admin",
    items: [
      { href: "/intake", label: "Referrals & Intake", icon: FileInput, badge: 7, roles: [L, A] },
      { href: "/forms", label: "Smart Forms", icon: FormInput, roles: [A] },
      { href: "/tasks", label: "Tasks", icon: ListChecks, roles: [L, A, S, C] },
      { href: "/admin-operations", label: "Admin Operations", icon: ShieldCheck, roles: [L, A] },
      { href: "/automations", label: "Automations", icon: Workflow, roles: [L] },
    ],
  },
  {
    group: "Clinical",
    items: [
      { href: "/my-day", label: "My Day", icon: CalendarDays, roles: [C] },
      { href: "/clients", label: "Clients", icon: Contact, roles: [L, A, S, C] },
      { href: "/schedule", label: "Schedule", icon: CalendarClock, roles: [L, A, S, C] },
      { href: "/caseloads/sarah-thompson", label: "Caseloads", icon: Briefcase, roles: [L, S] },
      { href: "/supervision/sarah-thompson", label: "Supervision", icon: UserCheck, roles: [L, S] },
    ],
  },
  {
    group: "AI Workspace",
    items: [
      {
        href: "/case-notes/mia-robinson",
        label: "Case Notes",
        icon: FileText,
        badge: 5,
        roles: [S, C],
      },
      { href: "/reports", label: "Reports", icon: ClipboardList, roles: [L, A, S, C] },
      { href: "/admin-insights", label: "Admin Insights", icon: ChartPie, roles: [L] },
    ],
  },
  {
    group: "Platform",
    items: [
      { href: "/portal", label: "Family Portal", icon: Smartphone, roles: [L, C] },
      { href: "/settings", label: "Security & Integrations", icon: Lock, roles: [L] },
    ],
  },
];

/** The sidebar for one role: its pages only, empty groups dropped. */
export function navigationFor(role: Role) {
  return navigation
    .map(({ group, items }) => ({ group, items: items.filter((i) => i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

/** Who the demo is signed in as in each role view. */
export const roleUsers: Record<Role, { name: string; initials: string; title: string }> = {
  Leadership: { name: "Neil Hensley", initials: "NH", title: "Director of Clinical Services" },
  Admin: { name: "Admin team", initials: "AT", title: "Intake & administration" },
  Supervisor: { name: "Grace Liu", initials: "GL", title: "Senior OT & Clinical Supervisor" },
  Clinician: { name: "Hannah Wright", initials: "HW", title: "Occupational Therapist" },
};

type RouteMeta = { section: string; page: string; role: Role };

const routes: { prefix: string; meta: RouteMeta }[] = [
  {
    prefix: "/intake",
    meta: { section: "Intake & Admin", page: "Referrals & Intake", role: "Admin" },
  },
  { prefix: "/forms", meta: { section: "Intake & Admin", page: "Smart Forms", role: "Admin" } },
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
  { prefix: "/reports", meta: { section: "AI Workspace", page: "Reports", role: "Clinician" } },
  {
    prefix: "/analytics",
    meta: { section: "Organisation", page: "Analytics", role: "Leadership" },
  },
  { prefix: "/portal", meta: { section: "Platform", page: "Family Portal", role: "Leadership" } },
  {
    prefix: "/settings",
    meta: { section: "Platform", page: "Security & Integrations", role: "Leadership" },
  },
  {
    prefix: "/team-capacity",
    meta: { section: "Organisation", page: "Team Capacity", role: "Leadership" },
  },
  {
    prefix: "/clients-requiring-attention",
    meta: { section: "Organisation", page: "Clients Requiring Attention", role: "Leadership" },
  },
  {
    prefix: "/caseloads",
    meta: { section: "Clinical · Caseloads", page: "Sarah Thompson", role: "Leadership" },
  },
  {
    prefix: "/supervision",
    meta: { section: "Clinical · Supervision", page: "Sarah Thompson", role: "Supervisor" },
  },
  { prefix: "/my-day", meta: { section: "Clinical", page: "My Day", role: "Clinician" } },
  {
    prefix: "/case-notes",
    meta: { section: "AI Workspace", page: "Case Notes", role: "Clinician" },
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
  Admin: "/intake",
  Supervisor: "/supervision/sarah-thompson",
  Clinician: "/my-day",
};
