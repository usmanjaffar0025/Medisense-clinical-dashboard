import { aiLog } from "@/lib/ai/log";
import {
  adviseQueue,
  extractReferral,
  prepareFromNote,
  writeBrief,
  writeBriefing,
  writeChangeSummary,
  writeClaimsSummary,
  writeDaySummary,
  writeNote,
} from "@/lib/ai/story";
import { AiError } from "@/lib/ai/types";
import type { SessionNote } from "@/lib/story/types";

const MAX_BODY = 60_000;
const MAX_LINES = 60;

function respond(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function isNote(v: unknown): v is SessionNote {
  if (!isObject(v) || !isObject(v.sections)) return false;
  const sections = v.sections;
  return ["subjective", "objective", "assessment", "plan"].every((k) => Array.isArray(sections[k]));
}

/** Every AI step in the connected story. The screens fall back to prepared output on a failure. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return respond({ ok: false, error: "Request too large" }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) throw new SyntaxError();
    body = parsed;
  } catch {
    return respond({ ok: false, error: "Request body must be JSON" }, 400);
  }

  try {
    switch (body.kind) {
      case "note": {
        const lines = Array.isArray(body.lines)
          ? body.lines.filter((l): l is string => typeof l === "string" && l.trim() !== "")
          : [];
        if (lines.length === 0 || lines.length > MAX_LINES) {
          return respond({ ok: false, error: "Add the dictation first" }, 400);
        }
        const context = typeof body.context === "string" ? body.context.slice(0, 500) : undefined;
        return respond({ ok: true, ...(await writeNote(lines, context)) });
      }
      case "referral": {
        const lines = Array.isArray(body.lines)
          ? body.lines.filter((l): l is string => typeof l === "string" && l.trim() !== "")
          : [];
        if (lines.length === 0 || lines.length > MAX_LINES) {
          return respond({ ok: false, error: "Paste the referral first" }, 400);
        }
        return respond({ ok: true, ...(await extractReferral(lines)) });
      }
      case "prepare":
        if (!isNote(body.note)) return respond({ ok: false, error: "Note is missing" }, 400);
        return respond({ ok: true, ...(await prepareFromNote(body.note)) });
      case "brief":
        if (!isObject(body.facts)) return respond({ ok: false, error: "Facts are missing" }, 400);
        return respond({ ok: true, ...(await writeBrief(body.facts)) });
      case "briefing":
        if (!isObject(body.facts)) return respond({ ok: false, error: "Facts are missing" }, 400);
        return respond({ ok: true, ...(await writeBriefing(body.facts)) });
      case "claims":
        if (!isObject(body.facts)) return respond({ ok: false, error: "Facts are missing" }, 400);
        return respond({ ok: true, ...(await writeClaimsSummary(body.facts)) });
      case "change":
        if (!isObject(body.facts)) return respond({ ok: false, error: "Facts are missing" }, 400);
        return respond({ ok: true, ...(await writeChangeSummary(body.facts)) });
      case "day":
        if (!isObject(body.facts)) return respond({ ok: false, error: "Facts are missing" }, 400);
        return respond({ ok: true, ...(await writeDaySummary(body.facts)) });
      case "queue":
        if (!Array.isArray(body.tasks) || !Array.isArray(body.team)) {
          return respond({ ok: false, error: "Tasks are missing" }, 400);
        }
        return respond({
          ok: true,
          ...(await adviseQueue(
            body.tasks.filter(isObject),
            body.team.filter((t): t is string => typeof t === "string"),
          )),
        });
      default:
        return respond({ ok: false, error: "Unknown request" }, 400);
    }
  } catch (error) {
    const reason = error instanceof AiError ? error.message : "Unexpected error";
    if (!(error instanceof AiError)) {
      aiLog.error(`story: ${error instanceof Error ? error.message : String(error)}`);
    }
    return respond({ ok: false, error: reason }, 503);
  }
}
