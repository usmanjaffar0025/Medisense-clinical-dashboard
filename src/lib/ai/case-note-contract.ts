/** Shared between the summarise route and the case note screen. */
export type StructuredNote = {
  summary: string;
  /** What the client or family reported, for the SOAP view. */
  subjective: string[];
  interventions: string[];
  observations: string[];
  nextActions: string[];
  /** Gaps a reviewer should check before approving, e.g. no goal referenced. */
  missingInformation: string[];
  /** 1-based note line that best supports the first summary sentence, or null. */
  summarySourceLine: number | null;
};

export type SummariseResponse =
  | {
      ok: true;
      source: "live" | "scripted";
      model: string | null;
      latencyMs: number | null;
      note: StructuredNote;
      notice: string | null;
    }
  | { ok: false; error: string };

export const MAX_NOTE_CHARS = 4000;
