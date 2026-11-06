import { aiLog } from "./log";
import type { ActiveProvider } from "./providers";
import {
  AiError,
  runTool,
  type AiOutput,
  type JsonRequest,
  type KeyCheck,
  type ToolRequest,
} from "./types";

/**
 * OpenAI, Google Gemini (AI Studio) and Groq all serve the OpenAI chat-completions API, so one
 * small client covers the three. Plain `fetch` keeps the project free of extra SDKs.
 */

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type ChatResponse = {
  model?: string;
  choices?: {
    message?: { content?: string | null; tool_calls?: ToolCall[] };
    finish_reason?: string;
  }[];
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    readonly retryAfter: number | null,
  ) {
    super(`HTTP ${status}`);
  }
}

/** Longest wait for a rate limit before giving up, so a demo never hangs. */
const MAX_RETRY_WAIT_S = 20;

/** Billing problems, as opposed to a rate limit (Groq's limit message links to its billing page). */
const isBilling = (body: string) =>
  /insufficient_quota|credit balance|exceeded your current quota|payment required/i.test(body);

/** A daily cap: waiting a few seconds will not help. */
const isDaily = (body: string) => /per day|\(TPD\)|\(RPD\)/i.test(body);

async function call(provider: ActiveProvider, path: string, body?: unknown, retried = false) {
  let res: Response;
  try {
    res = await fetch(`${provider.baseURL}${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    throw new AiError(
      `Could not reach ${provider.label}${error instanceof Error ? ` (${error.name})` : ""}`,
    );
  }
  if (!res.ok) {
    const header = Number.parseFloat(res.headers.get("retry-after") ?? "");
    const error = new HttpError(
      res.status,
      await res.text(),
      Number.isFinite(header) ? header : null,
    );
    // Free tiers limit tokens per minute; wait out a short limit once instead of failing.
    if (res.status === 429 && !retried && !isBilling(error.body) && !isDaily(error.body)) {
      const wait = Math.min(error.retryAfter ?? 6, MAX_RETRY_WAIT_S);
      aiLog.warn(`${provider.label}: rate limited, retrying in ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      return call(provider, path, body, true);
    }
    throw error;
  }
  return res.json() as Promise<unknown>;
}

function toAiError(provider: ActiveProvider, error: unknown): never {
  if (error instanceof AiError) throw error;
  if (error instanceof HttpError) {
    const detail = error.body.slice(0, 300);
    aiLog.error(`${provider.label}: HTTP ${error.status}: ${detail}`);
    if (error.status === 401 || error.status === 403)
      throw new AiError(`API key rejected (${error.status})`);
    if (error.status === 404)
      throw new AiError(`Model ${provider.model} not available; set AI_MODEL`);
    if (error.status === 429) {
      throw new AiError(
        isBilling(error.body)
          ? `No credits or quota left on this ${provider.label} account`
          : isDaily(error.body)
            ? `${provider.label} daily free limit reached; it resets within 24 hours`
            : `${provider.label} rate limit reached (free tier per-minute limit); try again in a minute`,
      );
    }
    throw new AiError(`${provider.label} error ${error.status}`);
  }
  throw error;
}

export async function checkCompatible(provider: ActiveProvider): Promise<KeyCheck> {
  try {
    await call(provider, "/models");
    return { ok: true };
  } catch (error) {
    if (error instanceof HttpError && (error.status === 401 || error.status === 403))
      return { ok: false, kind: "invalid", reason: `Key rejected (${error.status})` };
    if (error instanceof HttpError)
      return { ok: false, kind: "unreachable", reason: `API error ${error.status}` };
    return { ok: false, kind: "unreachable", reason: "Network error" };
  }
}

/** Some models wrap JSON in a Markdown fence; strip it before parsing. */
function stripFence(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

function firstChoice(data: unknown) {
  const choice = (data as ChatResponse).choices?.[0];
  if (!choice?.message) throw new AiError("Empty response from the AI service");
  return {
    message: choice.message,
    finish: choice.finish_reason,
    model: (data as ChatResponse).model,
  };
}

/**
 * Asks for JSON that matches the schema. Strict JSON-schema mode is tried first; providers or
 * models without it get plain JSON mode with the schema written into the instructions.
 */
async function jsonCompletion(
  provider: ActiveProvider,
  request: JsonRequest,
  messages: ChatMessage[],
) {
  const strict = {
    model: provider.model,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: { name: request.schemaName, schema: request.schema, strict: true },
    },
  };
  try {
    return firstChoice(await call(provider, "/chat/completions", strict));
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 400) throw error;
    aiLog.warn(`${provider.label}: strict JSON schema not accepted, retrying in JSON mode`);
    const [system, ...rest] = messages;
    const withSchema: ChatMessage = {
      role: "system",
      content: `${system?.content ?? ""}\n\nRespond with one JSON object only, matching this JSON schema:\n${JSON.stringify(request.schema)}`,
    };
    return firstChoice(
      await call(provider, "/chat/completions", {
        model: provider.model,
        messages: [withSchema, ...rest],
        response_format: { type: "json_object" },
      }),
    );
  }
}

export async function compatibleJson(
  provider: ActiveProvider,
  request: JsonRequest,
): Promise<AiOutput> {
  try {
    const { message, finish, model } = await jsonCompletion(provider, request, [
      { role: "system", content: request.system },
      { role: "user", content: request.user },
    ]);
    if (finish === "length") throw new AiError("The answer was cut off");
    return {
      text: stripFence(message.content ?? ""),
      model: model ?? provider.model,
      toolCalls: [],
    };
  } catch (error) {
    toAiError(provider, error);
  }
}

/**
 * Tool loop: the model calls tools until it has what it needs, then one final request asks for
 * the answer in the schema. Splitting the two keeps it working on providers that cannot combine
 * tools with a JSON response format.
 */
export async function compatibleTools(
  provider: ActiveProvider,
  request: ToolRequest,
): Promise<AiOutput> {
  const tools = request.tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
  const messages: ChatMessage[] = [
    { role: "system", content: request.system },
    { role: "user", content: request.user },
  ];
  const toolCalls: string[] = [];

  try {
    for (let step = 0; step < (request.maxSteps ?? 6); step++) {
      const { message } = firstChoice(
        await call(provider, "/chat/completions", {
          model: provider.model,
          messages,
          tools,
          tool_choice: "auto",
        }),
      );
      const calls = message.tool_calls ?? [];
      if (calls.length === 0) break;
      messages.push({ role: "assistant", content: message.content ?? null, tool_calls: calls });
      for (const c of calls) {
        toolCalls.push(c.function.name);
        let args: unknown = {};
        try {
          args = JSON.parse(c.function.arguments || "{}");
        } catch {
          args = {};
        }
        messages.push({
          role: "tool",
          tool_call_id: c.id,
          content: JSON.stringify(runTool(request.tools, c.function.name, args)),
        });
      }
    }
    messages.push({
      role: "user",
      content:
        "Using only the tool results above, write the final answer as JSON in the required format.",
    });
    const { message, finish, model } = await jsonCompletion(provider, request, messages);
    if (finish === "length") throw new AiError("The answer was cut off");
    return { text: stripFence(message.content ?? ""), model: model ?? provider.model, toolCalls };
  } catch (error) {
    toAiError(provider, error);
  }
}
