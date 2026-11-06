import { weeks } from "./weeks";

export type TimeCategory = {
  label: string;
  share: number;
  hours: number;
  colour: "evergreen" | "sage" | "sand" | "slate" | "stone";
};

export const loggedHoursPerWeek = 342;

/**
 * Org-wide logged time across all 12 clinicians, last 4 weeks. Medisense delivers therapy in
 * clients' homes, so driving between visits is its own category.
 */
export const timeByCategory: TimeCategory[] = [
  { label: "Clinical sessions", share: 55, hours: 188, colour: "evergreen" },
  { label: "Travel between visits", share: 12, hours: 41, colour: "slate" },
  { label: "Documentation", share: 16, hours: 55, colour: "sage" },
  { label: "Reports", share: 7, hours: 24, colour: "sand" },
  { label: "Scheduling & internal admin", share: 10, hours: 34, colour: "stone" },
];

/** Weekly non-session hours by category over the last 12 weeks, ending at the figures above. */
export const adminHoursByWeek = weeks.map((week, i) => ({
  week,
  documentation: [46, 47, 48, 49, 50, 50, 51, 52, 53, 53, 54, 55][i] ?? 0,
  reports: [20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24][i] ?? 0,
  travel: [35, 35, 36, 36, 37, 37, 38, 39, 39, 40, 40, 41][i] ?? 0,
  admin: [28, 28, 29, 29, 30, 30, 31, 32, 32, 33, 33, 34][i] ?? 0,
}));

export const automationOpportunities = [
  {
    label: "Case note summary",
    description: "Structures a clinician’s unstructured session note into a draft for review.",
    hours: 14,
    live: true,
  },
  {
    label: "Progress report drafting",
    description: "Drafts NDIS and aged care reports from approved notes, goals and outcomes.",
    hours: 9,
    live: true,
  },
  {
    label: "Supervision preparation",
    description: "Assembles caseload trends, open actions and flagged cases into a brief.",
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

export const automationTotal = { hours: "≈32 h / week", fte: "(≈0.8 FTE)" };

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
