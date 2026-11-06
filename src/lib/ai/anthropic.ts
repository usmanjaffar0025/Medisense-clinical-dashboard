import Anthropic from "@anthropic-ai/sdk";
import type { ActiveProvider } from "./providers";
import { aiLog } from "./log";
import {
  AiError,
  runTool,
  type AiOutput,
  type JsonRequest,
  type KeyCheck,
  type ToolRequest,
} from "./types";

let client: Anthropic | null = null;
let clientKey = "";

function getClient(key: string) {
  if (!client || clientKey !== key) {
    client = new Anthropic({ apiKey: key, maxRetries: 1, timeout: 60_000 });
    clientKey = key;
  }
  return client;
}

/** Retrieving the model is free and fails fast on a bad key or an unavailable model. */
export async function checkAnthropic(provider: ActiveProvider): Promise<KeyCheck> {
  try {
    await getClient(provider.key).models.retrieve(provider.model);
    return { ok: true };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError)
      return { ok: false, kind: "invalid", reason: "Key rejected (401)" };
    if (error instanceof Anthropic.PermissionDeniedError)
      return { ok: false, kind: "invalid", reason: "No permission (403)" };
    if (error instanceof Anthropic.NotFoundError)
      return { ok: false, kind: "invalid", reason: `Model ${provider.model} not available (404)` };
    if (error instanceof Anthropic.APIConnectionError)
      return { ok: false, kind: "unreachable", reason: "Network error" };
    if (error instanceof Anthropic.APIError)
      return { ok: false, kind: "unreachable", reason: `API error ${error.status ?? ""}`.trim() };
    throw error;
  }
}

function toAiError(error: unknown): never {
  if (error instanceof AiError) throw error;
  if (error instanceof Anthropic.AuthenticationError) throw new AiError("API key rejected (401)");
  if (error instanceof Anthropic.RateLimitError)
    throw new AiError("Rate limited, try again shortly");
  if (error instanceof Anthropic.APIConnectionError)
    throw new AiError("Could not reach the AI service");
  // The API has no dedicated error class for an empty credit balance, only this message.
  if (error instanceof Anthropic.BadRequestError && /credit balance/i.test(error.message)) {
    aiLog.error(
      "Claude: the Anthropic account has NO CREDITS. Add credits in the Anthropic Console.",
    );
    throw new AiError("No API credits on this Anthropic account");
  }
  if (error instanceof Anthropic.APIError) {
    aiLog.error(`Claude: API error ${error.status}: ${error.message}`);
    throw new AiError(`AI service error ${error.status ?? ""}`.trim());
  }
  throw error;
}

function finalText(response: Anthropic.Beta.BetaMessage) {
  if (response.stop_reason === "refusal") throw new AiError("The model declined this request");
  if (response.stop_reason === "max_tokens") throw new AiError("The answer was cut off");
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new AiError("No text in the response");
  return text.text;
}

function baseParams(provider: ActiveProvider, request: JsonRequest) {
  return {
    model: provider.model,
    max_tokens: request.maxTokens ?? 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default" as const,
    output_config: {
      effort: "low" as const,
      format: { type: "json_schema" as const, schema: request.schema },
    },
    system: request.system,
  };
}

export async function anthropicJson(
  provider: ActiveProvider,
  request: JsonRequest,
): Promise<AiOutput> {
  try {
    const response = await getClient(provider.key).beta.messages.create({
      ...baseParams(provider, request),
      messages: [{ role: "user", content: request.user }],
    });
    return { text: finalText(response), model: response.model, toolCalls: [] };
  } catch (error) {
    toAiError(error);
  }
}

/** Manual tool loop: Claude calls the read-only tools, then answers in the schema. */
export async function anthropicTools(
  provider: ActiveProvider,
  request: ToolRequest,
): Promise<AiOutput> {
  const tools: Anthropic.Beta.BetaTool[] = request.tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Beta.BetaTool.InputSchema,
  }));
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: request.user }];
  const toolCalls: string[] = [];

  try {
    for (let step = 0; step < (request.maxSteps ?? 6); step++) {
      const response = await getClient(provider.key).beta.messages.create({
        ...baseParams(provider, request),
        tools,
        messages,
      });
      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }
      if (response.stop_reason !== "tool_use") {
        return { text: finalText(response), model: response.model, toolCalls };
      }
      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use")
        .map((b) => {
          toolCalls.push(b.name);
          return {
            type: "tool_result",
            tool_use_id: b.id,
            content: JSON.stringify(runTool(request.tools, b.name, b.input)),
          };
        });
      messages.push({ role: "user", content: results });
    }
    throw new AiError("The assistant needed too many steps");
  } catch (error) {
    toAiError(error);
  }
}
