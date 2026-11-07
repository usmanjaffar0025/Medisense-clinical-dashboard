/** Shared between the story AI route and the screens. Every AI result is a draft for a person. */

export type NoteSentence = {
  id: string;
  text: string;
  /** 1-based dictated line this came from, or null when the clinician added it by hand. */
  line: number | null;
  edited?: boolean;
};

export type NoteSectionId = "subjective" | "objective" | "assessment" | "plan";

export type SessionNote = {
  sections: Record<NoteSectionId, NoteSentence[]>;
  missing: { id: string; text: string }[];
};

export type ReportSection = {
  name: string;
  text: string;
  from: string;
  /** Ids of note sentences this section used. */
  sources: string[];
};

export type ProposedTask = {
  id: string;
  title: string;
  owner: string;
  dueInWorkingDays: number;
  type: "Client follow-up" | "Document request" | "Communication" | "Scheduling" | "Supervision";
  sentenceId: string;
};

export type Prepared = {
  report: ReportSection[];
  formReason: string;
  formSources: string[];
  tasks: ProposedTask[];
};

export type BriefItem = { heading: string; text: string; source: string };

export type Brief = { items: BriefItem[]; points: string[] };

export type QueueAdvice = {
  order: string[];
  suggestions: { taskId: string; owner: string; reason: string }[];
};

export type AiMeta = {
  source: "live" | "prepared";
  model: string | null;
  latencyMs: number | null;
};

export type ReferralExtraction = {
  client: string;
  age: number | null;
  funding: "NDIS" | "Aged care" | "Unknown";
  services: string;
  suburb: string;
  contactName: string;
  contactPhone: string;
  fields: { label: string; value: string; line: number; confidence: "High" | "Check" }[];
  missing: string[];
  requestEmail: string;
};

export type StoryRequest =
  | { kind: "referral"; lines: string[] }
  | { kind: "note"; lines: string[]; context?: string }
  | { kind: "claims"; facts: Record<string, unknown> }
  | { kind: "prepare"; note: SessionNote }
  | { kind: "brief"; facts: Record<string, unknown> }
  | { kind: "briefing"; facts: Record<string, unknown> }
  | { kind: "change"; facts: Record<string, unknown> }
  | { kind: "day"; facts: Record<string, unknown> }
  | { kind: "queue"; tasks: Record<string, unknown>[]; team: string[] };

export type StoryResponse<T> =
  { ok: true; data: T; model: string; latencyMs: number } | { ok: false; error: string };

export const noteSectionTitles: { id: NoteSectionId; title: string }[] = [
  { id: "subjective", title: "Subjective" },
  { id: "objective", title: "Objective" },
  { id: "assessment", title: "Assessment" },
  { id: "plan", title: "Plan" },
];

export function allSentences(note: SessionNote) {
  return noteSectionTitles.flatMap(({ id }) => note.sections[id]);
}
