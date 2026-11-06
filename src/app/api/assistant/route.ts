import { AiError, generateJson, generateWithTools } from "@/lib/ai/engine";
import { aiLog } from "@/lib/ai/log";
import { runTool } from "@/lib/ai/types";
import { plan } from "@/lib/knowledge/local";
import type { Answer, LiveState } from "@/lib/knowledge/state";
import { aiTools } from "@/lib/knowledge/tools";
import { dt } from "@/lib/clock";

const MAX_QUESTION = 500;
const MAX_BODY = 300_000;

const SYSTEM = `You are Ask Medisense, the assistant inside Medisense's clinical operations platform. Medisense is an allied health provider in Brisbane (occupational therapy and speech pathology, home visits and telehealth, NDIS and aged care clients). Today is ${dt("Tuesday 20 October 2026")}, 10:15 am.

How to answer:
- Answer only from the records: either the records given with the question, or tool results when tools are available (call the ones you need; several when the question spans topics). Never invent people, numbers or dates.
- If the records do not have the answer, say so plainly and suggest what the user could ask instead.
- Reply in the language of the question, in plain, professional words.
- title: a short headline that answers the question.
- intro: two or three sentences with the direct answer and the key numbers.
- items: up to 8 supporting facts, most important first. label is the fact; detail adds context; href is the screen link copied from the tool result, or "" when there is none.
- sources: the record types you used, e.g. "Tasks", "Schedule".
- You only read records. Never claim to have changed, sent or booked anything; say which screen the user can act on instead.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "intro", "items", "sources"],
  properties: {
    title: { type: "string" },
    intro: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "detail", "href"],
        properties: {
          label: { type: "string" },
          detail: { type: "string" },
          href: { type: "string" },
        },
      },
    },
    sources: { type: "array", items: { type: "string" } },
  },
} as const;

function respond(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Coerces the browser's demo state into safe defaults; it is data, never instructions. */
function readState(value: unknown): LiveState {
  const v = (typeof value === "object" && value !== null ? value : {}) as Partial<LiveState>;
  const obj = <T>(x: unknown, d: T) =>
    typeof x === "object" && x !== null && !Array.isArray(x) ? (x as T) : d;
  const arr = <T>(x: unknown) => (Array.isArray(x) ? (x as T[]) : []);
  return {
    role: v.role ?? "Leadership",
    tasks: arr(v.tasks),
    referralStatus: obj(v.referralStatus, {}),
    noteModes: obj(v.noteModes, {}),
    forms: obj(v.forms, {}),
    suggestions: obj(v.suggestions, {}),
    reminders: arr(v.reminders),
    reports: obj(v.reports, {}),
    reportApproved: v.reportApproved === true,
    automations: obj(v.automations, {}),
    audit: arr<LiveState["audit"][number]>(v.audit).slice(0, 40),
  };
}

function parseAnswer(text: string): Answer {
  const data = JSON.parse(text) as Record<string, unknown>;
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    title: typeof data.title === "string" ? data.title : "Answer",
    intro: typeof data.intro === "string" ? data.intro : "",
    items: items
      .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
      .slice(0, 10)
      .map((i) => {
        const href = typeof i.href === "string" && i.href.startsWith("/") ? i.href : undefined;
        return {
          label: String(i.label ?? ""),
          detail: String(i.detail ?? ""),
          ...(href ? { href } : {}),
        };
      }),
    sources: Array.isArray(data.sources) ? data.sources.map(String).slice(0, 6) : [],
  };
}

/** Ask Medisense with live AI: the model reads the demo records through tools, then answers. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return respond({ ok: false, error: "Request too large" }, 413);

  let question = "";
  let state: LiveState;
  try {
    const body = JSON.parse(raw) as { question?: unknown; state?: unknown };
    question = typeof body.question === "string" ? body.question.trim().slice(0, MAX_QUESTION) : "";
    state = readState(body.state);
  } catch {
    return respond({ ok: false, error: "Request body must be JSON" }, 400);
  }
  if (!question) return respond({ ok: false, error: "Ask a question first" }, 400);

  const tools = aiTools(state);
  const header = `Viewing as: ${state.role}
Question: ${question}`;
  const route = plan(question, state, { curated: false });

  // Small talk needs no records and no model.
  if (route.kind === "small-talk") {
    return respond({
      ok: true,
      answer: route.answer,
      provider: "Medisense",
      model: "instant",
      toolCalls: [],
      mode: "instant",
      latencyMs: 0,
    });
  }

  try {
    // Records first: when the router knows which tools fit, run them here and send the model
    // one request with the results. Only unclear questions fall back to the tool loop.
    const output =
      route.kind === "tools"
        ? await generateJson("assistant", {
            system: SYSTEM,
            user: `${header}

Records fetched for this question by Medisense tools:
${JSON.stringify(
  route.calls.map((c) => ({
    tool: c.name,
    input: c.input,
    result: runTool(tools, c.name, c.input),
  })),
)}`,
            schema: SCHEMA,
            schemaName: "assistant_answer",
            maxTokens: 4000,
          }).then((o) => ({
            ...o,
            toolCalls: route.calls.map((c) => c.name),
            mode: "records-first" as const,
          }))
        : await generateWithTools("assistant", {
            system: SYSTEM,
            user: header,
            schema: SCHEMA,
            schemaName: "assistant_answer",
            tools,
            maxSteps: 4,
            maxTokens: 4000,
          }).then((o) => ({ ...o, mode: "tool-loop" as const }));
    return respond({
      ok: true,
      answer: parseAnswer(output.text),
      provider: output.provider,
      model: output.model,
      toolCalls: output.toolCalls,
      mode: output.mode,
      latencyMs: output.latencyMs,
    });
  } catch (error) {
    const reason =
      error instanceof AiError
        ? error.message
        : error instanceof SyntaxError
          ? "The answer could not be read"
          : "Unexpected error";
    if (!(error instanceof AiError)) {
      aiLog.error(`assistant: ${error instanceof Error ? error.message : String(error)}`);
    }
    return respond({ ok: false, error: reason }, 503);
  }
}
