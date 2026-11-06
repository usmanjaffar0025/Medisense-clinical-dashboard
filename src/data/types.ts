export type Complexity = "High" | "Medium" | "Low";

export type CaseloadStatus = "healthy" | "monitor" | "at-risk";

export type Priority = "High" | "Medium" | "Review";

export type Discipline = "Occupational Therapy" | "Speech Pathology";

/** Medisense works from client homes, so clinicians are grouped by service region, not clinic. */
export type Site = "Brisbane North" | "Brisbane South";

export type Funding = "NDIS" | "Aged care";

export type ComplexityMix = { high: number; medium: number; low: number };

/** Twelve weekly values, oldest first, ending with the week of 19 Oct. */
export type WeeklySeries = number[];

export type Clinician = {
  id: string;
  name: string;
  firstName: string;
  role: string;
  discipline: Discipline;
  site: Site;
  fte: number;
  active: number;
  capacity: number;
  utilisation: number;
  complexity: Complexity;
  mix: ComplexityMix;
  highComplexity: number;
  weightedUnits: number;
  weightedCapacity: number;
  notesOverdue: number;
  draftsAwaiting: number;
  notesDue: number;
  followUpsOverdue: number;
  funding: { ndis: number; agedCare: number };
  adminHours: number;
  adminTarget: number;
  nextSupervision: string;
  supervisionNote: string;
  supervisionDue: boolean;
  supervisionHistory: SupervisionOutcome[];
  score: number;
  status: CaseloadStatus;
  available: boolean;
  history: {
    active: WeeklySeries;
    notesDue: WeeklySeries;
    followUpsOverdue: WeeklySeries;
    score: WeeklySeries;
    adminHours: WeeklySeries;
  };
};

export type SupervisionOutcome = "held" | "rescheduled" | "cancelled";

export type ScoreFactor = {
  label: string;
  detail: string;
  points: number;
  max: number;
};

export type WeeklyTrend = {
  week: string;
  activeClients: number;
  weightedUnits: number;
  adminHours: number;
  clinicalHours: number;
};

export type DocumentationStatus =
  | { kind: "complete" }
  | { kind: "overdue"; days: number }
  | { kind: "ai-draft" }
  | { kind: "report-incomplete" };

export type AttentionStatus =
  | { kind: "requires-review"; priority: Priority }
  | { kind: "follow-up-due" }
  | { kind: "follow-up-overdue" }
  | { kind: "flagged-for-supervision" }
  | { kind: "none" };

export type ClientFilter = "requires-review" | "notes-overdue" | "follow-ups" | "high-complexity";

export type CaseloadClient = {
  id: string;
  name: string;
  age: number;
  service: string;
  funding: Funding;
  /** Months the client has been seen by this clinician, for continuity of care. */
  tenureMonths: number;
  lastSession: string;
  nextAppointment: { kind: "booked" | "today"; label: string } | { kind: "not-booked" | "paused" };
  complexity: Complexity;
  documentation: DocumentationStatus;
  attention: AttentionStatus;
  filters: ClientFilter[];
  caseNoteHref?: string;
};

export type ReasonType =
  "no-recent-appointment" | "follow-up" | "documentation" | "review" | "cancellations";

export type AttentionClient = {
  id: string;
  name: string;
  clinician: string;
  funding: Funding;
  priority: Priority;
  reason: string;
  daysSinceContact: number;
  reasonTypes: ReasonType[];
};

export type AuditEntry = {
  id: string;
  /** ISO date, moved to today by `dt` in the clock module. */
  day: string;
  time: string;
  actor: string;
  isAi: boolean;
  action: string;
  object: string;
};
