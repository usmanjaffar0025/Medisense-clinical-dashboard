import { clinicians } from "./clinicians";
import { dt } from "@/lib/clock";

export const sarahSupervision = {
  clinician: "Sarah Thompson",
  eyebrow: "Supervision · Next session in 2 days",
  session: `${dt("Thu 22 Oct 2026")}, 2:00 pm · 60 min · Video call · with Grace Liu`,
  supervisor: "Grace Liu",
  generatedAt: `Generated ${dt("20 Oct 2026")}, 09:15 · Source: caseload, notes, previous supervision`,
  facts: [
    { label: "Last supervision", value: dt("Thu 24 Sep") },
    { label: "Next", value: dt("Thu 22 Oct") },
    { label: "Frequency", value: "Every 4 weeks" },
    { label: "Protected time", value: "60 min", suffix: "blocked" },
    { label: "Held on schedule", value: "1", suffix: "of last 3" },
    { label: "Open actions", value: "2", suffix: "of 4" },
  ],
};

export type BriefSection =
  | "Workload changes"
  | "Overdue documentation"
  | "Complex cases"
  | "Pending follow-ups"
  | "Previous supervision actions";

export const briefSections: BriefSection[] = [
  "Workload changes",
  "Overdue documentation",
  "Complex cases",
  "Pending follow-ups",
  "Previous supervision actions",
];

export type AgendaItem = {
  section: BriefSection;
  text: string;
  evidence: string;
  href: string;
  details?: { client: string; change: string }[];
};

export const suggestedAgenda: AgendaItem[] = [
  {
    section: "Workload changes",
    text: "Caseload increased 18% over six weeks.",
    evidence: "View trend",
    href: "#workload",
  },
  {
    section: "Workload changes",
    text: "Admin hours exceeded the target for three consecutive weeks.",
    evidence: "View admin hours",
    href: "#workload",
  },
  {
    section: "Overdue documentation",
    text: "Four clinical notes remain incomplete.",
    evidence: "View 4 notes",
    href: "/caseloads/sarah-thompson",
  },
  {
    section: "Complex cases",
    text: "Two complex clients have recent changes requiring discussion.",
    evidence: "View 2 client records",
    href: "/caseloads/sarah-thompson",
    details: [
      { client: "Oliver Grant", change: `new external report received ${dt("14 Oct")}` },
      { client: "Ruth Hallam", change: "appointments paused following family update" },
    ],
  },
  {
    section: "Pending follow-ups",
    text: "Five client follow-ups are due, three of them overdue.",
    evidence: "View clients requiring attention",
    href: "/clients-requiring-attention",
    details: [
      { client: "James Thompson", change: "no appointment for 21 days" },
      { client: "Isla Murphy", change: "parent call-back overdue" },
      { client: "Henry Ng", change: "equipment quote follow-up overdue" },
    ],
  },
  {
    section: "Previous supervision actions",
    text: "Follow-up actions from previous supervision remain open (2 of 4).",
    evidence: "View previous actions",
    href: "#actions",
  },
];

export const flaggedCases = [
  { client: "James Thompson", reason: "No appointment for 21 days; follow-up overdue." },
  { client: "Daniel Lee", reason: "NDIS plan review approaching; progress report incomplete." },
  {
    client: "Oliver Grant",
    reason: `New external report received ${dt("14 Oct")}; note overdue 5 days.`,
  },
  {
    client: "Ruth Hallam",
    reason: "Appointments paused following family update; note overdue 14 days.",
  },
];

export const previousActions = [
  { action: "Close out September session notes", owner: "Sarah", open: true },
  { action: "Review appointment frequency for James Thompson", owner: "Sarah", open: true },
  { action: "Pause new intake while caseload > 25", owner: "Grace", open: false },
  { action: "Book assistive technology trial for Ruth Hallam", owner: "Sarah", open: false },
];

export const developmentGoals = [
  {
    goal: "Advanced sensory integration module",
    progress: 60,
    status: "60%",
    due: `Due ${dt("Dec 2026")}`,
  },
  {
    goal: "Supervision CPD hours for the year",
    progress: 70,
    status: "14 of 20 h",
    due: `Due ${dt("Jun 2027")}`,
  },
  {
    goal: "Co-facilitate parent education group",
    progress: 0,
    status: "Planned",
    due: "Term 4",
  },
];

/** Sarah's protected supervision sessions over the last three cycles. */
export const sarahSessions = [
  {
    date: dt("Thu 30 Jul"),
    outcome: "rescheduled",
    note: `Moved to ${dt("6 Aug")}: urgent home visit`,
  },
  { date: dt("Thu 27 Aug"), outcome: "cancelled", note: "Cancelled: client crisis visit" },
  { date: dt("Thu 24 Sep"), outcome: "held", note: "Held · 60 min" },
] as const;

const supervisionTimes: Record<string, string> = {
  "sarah-thompson": "2:00 pm",
  "hannah-wright": "11:00 am",
  "jessica-nguyen": "9:30 am",
  "marcus-bell": "1:00 pm",
};

/** Sessions in the next 14 days, all with Grace Liu. */
export const upcomingSupervision = clinicians
  .filter((c) => c.supervisionDue)
  .map((c) => ({
    id: c.id,
    clinician: c.name,
    when: `${c.nextSupervision}, ${supervisionTimes[c.id] ?? ""}`.trim(),
    status: c.status,
    briefReady: c.id === "sarah-thompson",
  }));

/** Team-wide supervision outcomes across the last three four-weekly cycles. */
export const supervisionCycles = ["Jul–Aug", "Aug–Sep", "Sep–Oct"].map((label, i) => {
  const outcomes = clinicians.map((c) => c.supervisionHistory[i]);
  return {
    label,
    held: outcomes.filter((o) => o === "held").length,
    rescheduled: outcomes.filter((o) => o === "rescheduled").length,
    cancelled: outcomes.filter((o) => o === "cancelled").length,
  };
});
