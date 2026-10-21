import {
  Briefcase,
  CalendarDays,
  ChartPie,
  ClipboardList,
  FileText,
  Flag,
  LayoutDashboard,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Role = "Leadership" | "Supervisor" | "Clinician";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export const navigation: { group: string; items: NavItem[] }[] = [
  {
    group: "Organisation",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/team-capacity", label: "Team Capacity", icon: Users },
      {
        href: "/clients-requiring-attention",
        label: "Clients Requiring Attention",
        icon: Flag,
        badge: 14,
      },
    ],
  },
  {
    group: "Clinical",
    items: [
      { href: "/caseloads/sarah-thompson", label: "Caseloads", icon: Briefcase },
      { href: "/supervision/sarah-thompson", label: "Supervision", icon: UserCheck },
      { href: "/my-day", label: "My Day", icon: CalendarDays },
    ],
  },
  {
    group: "AI Workspace",
    items: [
      { href: "/case-notes/mia-robinson", label: "Case Notes", icon: FileText, badge: 8 },
      { href: "/progress-reports/emily-carter", label: "Progress Reports", icon: ClipboardList },
      { href: "/admin-insights", label: "Admin Insights", icon: ChartPie },
    ],
  },
];

type RouteMeta = { section: string; page: string; role: Role };

const routes: { prefix: string; meta: RouteMeta }[] = [
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
    meta: { section: "AI Workspace · Case Notes", page: "Mia Robinson", role: "Leadership" },
  },
  {
    prefix: "/progress-reports",
    meta: { section: "AI Workspace · Progress Reports", page: "Emily Carter", role: "Clinician" },
  },
  {
    prefix: "/admin-insights",
    meta: { section: "AI Workspace", page: "Admin Insights", role: "Leadership" },
  },
];

const overview: RouteMeta = { section: "Organisation", page: "Overview", role: "Leadership" };

export function routeMeta(pathname: string): RouteMeta {
  return routes.find((r) => pathname.startsWith(r.prefix))?.meta ?? overview;
}

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const section = href.split("/").slice(0, 2).join("/");
  return pathname.startsWith(section);
}

export const roleHome: Record<Role, string> = {
  Leadership: "/",
  Supervisor: "/supervision/sarah-thompson",
  Clinician: "/my-day",
};
