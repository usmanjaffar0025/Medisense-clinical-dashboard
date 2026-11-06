import type { StructuredNote } from "./case-note-contract";
import { AiError, NO_KEY, generateJson } from "./engine";

const SYSTEM = `You draft structured session notes for allied health clinicians (occupational therapy and speech pathology) in Australia.

Turn the therapist's raw session note into a structured draft. The clinician reviews and approves every draft, so:
- Use only what the note says. Never add facts, scores, diagnoses, risk ratings or treatment decisions that are not in the note.
- If the note gives nothing for a section, return an empty list for it.
- Write in Australian English, in the plain, professional register of a clinical record. Refer to the person as "client" and family members by their role.

Sections:
- summary: two or three sentences. The first sentence states the main focus of the session.
- subjective: what the client, family or other people reported, as short phrases.
- interventions: what the clinician did in the session, as short phrases.
- observations: progress and observations reported or seen, as short phrases.
- nextActions: agreed next steps and who does them, as short phrases.
- missingInformation: things a reviewer would expect in a clinical record that this note does not state (for example no therapy goal referenced, a measurement or contact detail missing). Short phrases; empty if nothing is missing. Do not invent the missing content.
- summarySourceLine: the number of the note line that most directly supports the first summary sentence.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "subjective",
    "interventions",
    "observations",
    "nextActions",
    "missingInformation",
    "summarySourceLine",
  ],
  properties: {
    summary: { type: "string" },
    subjective: { type: "array", items: { type: "string" } },
    missingInformation: { type: "array", items: { type: "string" } },
    interventions: { type: "array", items: { type: "string" } },
    observations: { type: "array", items: { type: "string" } },
    nextActions: { type: "array", items: { type: "string" } },
    summarySourceLine: { type: "integer" },
  },
} as const;

/** Errors the route can show to the user; the same class every AI feature throws. */
export const SummariseError = AiError;

export { NO_KEY };

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function parseNote(text: string, lineCount: number): StructuredNote {
  const data: unknown = JSON.parse(text);
  if (typeof data !== "object" || data === null) throw new AiError("Response was not an object");
  const d = data as Record<string, unknown>;
  if (
    typeof d.summary !== "string" ||
    !isStringList(d.interventions) ||
    !isStringList(d.observations) ||
    !isStringList(d.nextActions) ||
    !isStringList(d.subjective) ||
    !isStringList(d.missingInformation)
  ) {
    throw new AiError("Response did not match the note structure");
  }
  const line = typeof d.summarySourceLine === "number" ? d.summarySourceLine : null;
  return {
    summary: d.summary.trim(),
    subjective: d.subjective,
    interventions: d.interventions,
    observations: d.observations,
    nextActions: d.nextActions,
    missingInformation: d.missingInformation,
    summarySourceLine: line && line >= 1 && line <= lineCount ? line : null,
  };
}

/** Structures a raw note with the configured AI provider. Throws `AiError` with a reason the UI can show. */
export async function summariseNote(lines: string[], context: string) {
  const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
  const output = await generateJson("summarise", {
    system: SYSTEM,
    user: `Client: ${context}\n\nTherapist's raw session note, one observation per line:\n${numbered}`,
    schema: SCHEMA,
    schemaName: "structured_note",
  });
  try {
    const note = parseNote(output.text, lines.length);
    return { note, model: `${output.provider} · ${output.model}`, latencyMs: output.latencyMs };
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError("The response could not be read");
  }
}
