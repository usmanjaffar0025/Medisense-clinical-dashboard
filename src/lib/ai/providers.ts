/**
 * The AI providers the platform can run on. Whichever key is in `.env.local` is used; set
 * `AI_PROVIDER` to choose when several keys are present and `AI_MODEL` to override the model.
 */
export type ProviderId = "anthropic" | "openai" | "google" | "groq";

type ProviderConfig = {
  id: ProviderId;
  label: string;
  /** Environment variables checked for the key, first match wins. */
  envKeys: string[];
  defaultModel: string;
  /** OpenAI-compatible endpoint; absent for Anthropic, which uses its own SDK. */
  baseURL?: string;
};

export const providers: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    id: "anthropic",
    label: "Claude",
    envKeys: ["ANTHROPIC_API_KEY"],
    defaultModel: "claude-opus-5-5",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    envKeys: ["OPENAI_API_KEY"],
    defaultModel: "gpt-5",
    baseURL: "https://api.openai.com/v1",
  },
  google: {
    id: "google",
    label: "Google Gemini",
    envKeys: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    defaultModel: "gemini-2.5-pro",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
  },
  groq: {
    id: "groq",
    label: "Groq",
    envKeys: ["GROQ_API_KEY"],
    defaultModel: "openai/gpt-oss-120b",
    baseURL: "https://api.groq.com/openai/v1",
  },
};

const order: ProviderId[] = ["anthropic", "openai", "google", "groq"];

export type ActiveProvider = ProviderConfig & { key: string; model: string; keyEnv: string };

function keyFor(config: ProviderConfig) {
  for (const env of config.envKeys) {
    const value = process.env[env]?.trim();
    if (value) return { key: value.replace(/^["']|["']$/g, ""), keyEnv: env };
  }
  return null;
}

/** The provider to use: `AI_PROVIDER` if its key is set, otherwise the first key found. */
export function activeProvider(): ActiveProvider | null {
  const requested = process.env.AI_PROVIDER?.trim().toLowerCase() as ProviderId | undefined;
  const candidates = requested && requested in providers ? [requested] : order;
  for (const id of candidates) {
    const config = providers[id];
    const found = keyFor(config);
    if (found) {
      const model = process.env.AI_MODEL?.trim() || config.defaultModel;
      return { ...config, ...found, model };
    }
  }
  return null;
}

/** The provider named by `AI_PROVIDER`, even when its key is missing, for clearer logs. */
export function requestedProvider() {
  const requested = process.env.AI_PROVIDER?.trim().toLowerCase();
  return requested && requested in providers ? providers[requested as ProviderId] : null;
}

/** Shows enough of the key to tell two keys apart without exposing it. */
export function maskKey(key: string) {
  if (key.length <= 16) return "(too short to be a valid key)";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}
