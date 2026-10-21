export type Complexity = "High" | "Medium" | "Low";

export type CaseloadStatus = "healthy" | "monitor" | "over";

export type Priority = "High" | "Medium" | "Low";

export type Clinician = {
  id: string;
  name: string;
  firstName: string;
  role: string;
  site: "Richmond" | "Box Hill";
  fte: number;
  active: number;
  capacity: number;
  utilisation: number;
  complexity: Complexity;
  highComplexity: number;
  notesOverdue: number;
  followUpsOverdue: number;
  nextSupervision: string;
  supervisionNote: string;
  score: number;
  status: CaseloadStatus;
  available?: boolean;
  weightedUnits?: number;
  weightedCapacity?: number;
};

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
  priority: Priority;
  reason: string;
  daysSinceContact: number;
  reasonTypes: ReasonType[];
};

export type AuditEntry = {
  id: string;
  day: "2026-10-20" | "2026-10-19";
  time: string;
  actor: string;
  isAi: boolean;
  action: string;
  object: string;
};
