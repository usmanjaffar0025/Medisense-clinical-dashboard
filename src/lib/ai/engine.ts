import { anthropicJson, anthropicTools, checkAnthropic } from "./anthropic";
import { aiLog } from "./log";
import { checkCompatible, compatibleJson, compatibleTools } from "./openai-compatible";
import {
  activeProvider,
  maskKey,
  providers,
  requestedProvider,
  type ActiveProvider,
} from "./providers";
import { AiError, type AiOutput, type JsonRequest, type ToolRequest } from "./types";

export { AiError } from "./types";

export const NO_KEY = "No AI provider key is set";

export type KeyStatus =
  | { state: "missing"; provider: null; model: string }
  | {
      state: "valid";
      provider: string;
      model: string;
      key: string;
      latencyMs: number;
      checkedAt: string;
    }
  | {
      state: "invalid" | "unreachable";
      provider: string;
      model: string;
      key: string;
      reason: string;
      checkedAt: string;
    };

let statusCheck: Promise<KeyStatus> | null = null;

const envNames = Object.values(providers)
  .flatMap((p) => p.envKeys)
  .join(", ");

async function runCheck(): Promise<KeyStatus> {
  const provider = activeProvider();
  const checkedAt = new Date().toISOString();
  if (!provider) {
    const requested = requestedProvider();
    aiLog.warn(
      requested
        ? `AI_PROVIDER is "${requested.id}" but ${requested.envKeys.join(" / ")} is not set. Live AI is off.`
        : `No AI key found (${envNames}). Live AI is off; prepared drafts are used. Add a key to .env.local and restart.`,
    );
    return { state: "missing", provider: null, model: "" };
  }

  const masked = maskKey(provider.key);
  aiLog.info(
    `Checking ${provider.label} key ${masked} (${provider.keyEnv}) with model ${provider.model}…`,
  );
  const started = Date.now();
  const result =
    provider.id === "anthropic" ? await checkAnthropic(provider) : await checkCompatible(provider);
  const base = { provider: provider.label, model: provider.model, key: masked, checkedAt };

  if (result.ok) {
    const latencyMs = Date.now() - started;
    aiLog.info(
      `${provider.label} key ${masked} is VALID (${latencyMs} ms). Live AI is on with ${provider.model}.`,
    );
    return { state: "valid", ...base, latencyMs };
  }
  aiLog.error(`${provider.label} key ${masked} is ${result.kind.toUpperCase()}: ${result.reason}.`);
  return { state: result.kind, ...base, reason: result.reason };
}

/** Checks the active key once per server process; pass `force` to check again. */
export function checkAiKey(force = false) {
  if (!statusCheck || force) statusCheck = runCheck();
  return statusCheck;
}

async function ready(): Promise<ActiveProvider> {
  const status = await checkAiKey();
  const provider = activeProvider();
  if (!provider || status.state === "missing") throw new AiError(NO_KEY);
  if (status.state === "invalid") throw new AiError(`API key invalid: ${status.reason}`);
  return provider;
}

function logDone(task: string, provider: ActiveProvider, started: number, output: AiOutput) {
  const tools = output.toolCalls.length ? ` · tools: ${output.toolCalls.join(", ")}` : "";
  aiLog.info(
    `${task}: done in ${Date.now() - started} ms · ${provider.label} ${output.model}${tools}`,
  );
}

/** One request that must answer in the given JSON schema. */
export async function generateJson(task: string, request: JsonRequest) {
  const provider = await ready();
  const started = Date.now();
  aiLog.info(`${task}: calling ${provider.label} ${provider.model}`);
  const output =
    provider.id === "anthropic"
      ? await anthropicJson(provider, request)
      : await compatibleJson(provider, request);
  logDone(task, provider, started, output);
  return { ...output, provider: provider.label, latencyMs: Date.now() - started };
}

/** A tool-using request: the model reads data through the tools, then answers in the schema. */
export async function generateWithTools(task: string, request: ToolRequest) {
  const provider = await ready();
  const started = Date.now();
  aiLog.info(
    `${task}: calling ${provider.label} ${provider.model} with ${request.tools.length} tools`,
  );
  const output =
    provider.id === "anthropic"
      ? await anthropicTools(provider, request)
      : await compatibleTools(provider, request);
  logDone(task, provider, started, output);
  return { ...output, provider: provider.label, latencyMs: Date.now() - started };
}
