import { caseNoteById, noteText, type CaseNoteSample } from "@/data/case-note";
import {
  MAX_NOTE_CHARS,
  type StructuredNote,
  type SummariseResponse,
} from "@/lib/ai/case-note-contract";
import { aiLog } from "@/lib/ai/log";
import { NO_KEY, SummariseError, summariseNote } from "@/lib/ai/summarise-note";

function preparedNote(sample: CaseNoteSample): StructuredNote {
  return { ...sample.draft, summarySourceLine: sample.pairedLine };
}

function toLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function respond(body: SummariseResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Structures a raw therapist note with Claude. When live AI is unavailable and the note is
 * one of the unchanged demo samples, its prepared draft is returned so the demo never stalls.
 */
export async function POST(request: Request) {
  let notes = "";
  let caseId = "";
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null) {
      if ("notes" in body && typeof body.notes === "string") notes = body.notes;
      if ("caseId" in body && typeof body.caseId === "string") caseId = body.caseId;
    }
  } catch {
    return respond({ ok: false, error: "Request body must be JSON" }, 400);
  }

  const sample = caseNoteById(caseId);
  if (!sample) return respond({ ok: false, error: "Unknown case" }, 404);

  const lines = toLines(notes);
  if (lines.length === 0) return respond({ ok: false, error: "Add the session note first" }, 400);
  if (notes.length > MAX_NOTE_CHARS) {
    return respond({ ok: false, error: `Notes are limited to ${MAX_NOTE_CHARS} characters` }, 400);
  }

  const isSample = lines.join("\n") === toLines(noteText(sample)).join("\n");

  try {
    const { note, model, latencyMs } = await summariseNote(lines, sample.context);
    return respond({ ok: true, source: "live", model, latencyMs, note, notice: null });
  } catch (error) {
    const reason = error instanceof SummariseError ? error.message : "Unexpected error";
    if (!(error instanceof SummariseError)) {
      aiLog.error(
        `summarise: unexpected failure: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (isSample) {
      aiLog.info(`summarise: serving prepared draft for ${sample.id} (${reason})`);
      return respond({
        ok: true,
        source: "scripted",
        model: null,
        latencyMs: null,
        note: preparedNote(sample),
        notice:
          reason === NO_KEY
            ? "Demo mode: prepared draft for this note. Live AI is not connected."
            : `Live AI unavailable (${reason}). Showing the prepared draft for this note.`,
      });
    }
    return respond({ ok: false, error: `Live AI unavailable: ${reason}` }, 503);
  }
}
