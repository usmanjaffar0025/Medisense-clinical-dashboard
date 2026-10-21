export type TimeCategory = {
  label: string;
  share: number;
  hours: number;
  colour: "evergreen" | "sage" | "sand" | "slate" | "stone";
};

export const loggedHoursPerWeek = 353;

export const timeByCategory: TimeCategory[] = [
  { label: "Clinical sessions", share: 61, hours: 215, colour: "evergreen" },
  { label: "Documentation", share: 18, hours: 64, colour: "sage" },
  { label: "Reports", share: 8, hours: 28, colour: "sand" },
  { label: "Scheduling & follow-ups", share: 6, hours: 21, colour: "slate" },
  { label: "Internal admin", share: 7, hours: 25, colour: "stone" },
];

export const automationOpportunities = [
  {
    label: "Case note summary",
    description: "Structures a clinician’s unstructured session note into a draft for review.",
    hours: 14,
    live: true,
  },
  {
    label: "Progress report drafting",
    description: "Drafts funding reports from approved notes, goals and outcome measures.",
    hours: 9,
    live: true,
  },
  {
    label: "Supervision preparation",
    description: "Assembles caseload trends, open actions and flagged cases into an agenda.",
    hours: 4,
    live: true,
  },
  {
    label: "Follow-up identification",
    description: "Surfaces overdue follow-ups and unbooked clients from scheduling data.",
    hours: 3,
    live: true,
  },
  {
    label: "Weekly caseload summary",
    description: "Summarises caseload changes across the team for leadership each week.",
    hours: 2,
    live: false,
  },
];

export const automationTotal = { hours: "≈32 h / week", fte: "(≈0.85 FTE)" };

export const guardrails = [
  {
    title: "AI drafts, clinicians decide",
    body: "Nothing reaches the clinical record until a named clinician approves it.",
  },
  {
    title: "Every AI output is labelled and audited",
    body: "Drafts carry their source and generation time; approvals and edits are logged.",
  },
  {
    title: "Operational indicators, not diagnoses",
    body: "Flags describe scheduling, documentation and capacity. They are not clinical assessments.",
  },
];
