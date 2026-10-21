export const sarahSupervision = {
  clinician: "Sarah Thompson",
  eyebrow: "Supervision · Next session in 2 days",
  session: "Thu 22 Oct 2026, 2:00 pm · 60 min · Richmond, Room 3 · with Grace Liu",
  supervisor: "Grace Liu",
  generatedAt: "Generated 20 Oct 2026, 09:15 · Source: caseload, notes, previous supervision",
  facts: [
    { label: "Last supervision", value: "Thu 24 Sep" },
    { label: "Next", value: "Thu 22 Oct" },
    { label: "Frequency", value: "Every 4 weeks" },
    { label: "Cases flagged", value: "4" },
    { label: "Open actions", value: "2", suffix: "of 4" },
    { label: "Development goals", value: "2" },
  ],
};

export type AgendaItem = {
  text: string;
  evidence: string;
  href: string;
  details?: { client: string; change: string }[];
};

export const suggestedAgenda: AgendaItem[] = [
  { text: "Caseload increased 18% over six weeks.", evidence: "View trend", href: "#workload" },
  {
    text: "Four clinical notes remain incomplete.",
    evidence: "View 4 notes",
    href: "/caseloads/sarah-thompson",
  },
  {
    text: "Two complex clients have recent changes requiring discussion.",
    evidence: "View 2 client records",
    href: "/caseloads/sarah-thompson",
    details: [
      { client: "Oliver Grant", change: "new external report received 14 Oct" },
      { client: "Ruth Hallam", change: "appointments paused following family update" },
    ],
  },
  {
    text: "Follow-up actions from previous supervision remain open (2 of 4).",
    evidence: "View previous actions",
    href: "#actions",
  },
  {
    text: "Admin hours exceeded the target for three consecutive weeks.",
    evidence: "View admin hours",
    href: "#workload",
  },
];

export const flaggedCases = [
  { client: "James Thompson", reason: "No appointment for 21 days; follow-up overdue." },
  { client: "Daniel Lee", reason: "Funding review approaching; progress report incomplete." },
  { client: "Oliver Grant", reason: "New external report received 14 Oct; note overdue 5 days." },
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
  { goal: "Advanced sensory integration module", progress: 60, status: "60%", due: "Due Dec 2026" },
  { goal: "Co-facilitate parent education group", progress: 0, status: "Planned", due: "Term 4" },
];
