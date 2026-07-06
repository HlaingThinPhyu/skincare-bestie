export type AIProvider = "anthropic" | "gemini" | "ninerouter";

export interface AIConfig {
  provider: AIProvider;
  baseURL: string | undefined;
  apiKey: string;
  model: string;
}

const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-sonnet-latest";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

function normalizeProviderName(value: string | undefined): AIProvider {
  if (value === "gemini") {
    return "gemini";
  }
  if (value === "ninerouter") {
    return "ninerouter";
  }
  return "anthropic";
}

export function getAIConfig(): AIConfig {
  if (process.env.USE_NINEROUTER === "true") {
    return {
      provider: "ninerouter",
      baseURL: process.env.NINEROUTER_BASE_URL ?? "http://127.0.0.1:20128",
      apiKey: process.env.NINEROUTER_API_KEY ?? "",
      model: process.env.NINEROUTER_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
    };
  }

  const rawProvider = process.env.AI_PROVIDER?.trim().toLowerCase();
  const explicitProvider = normalizeProviderName(rawProvider);

  // If provider is explicitly set to a non-gemini value, respect it without auto-detecting Gemini
  const autoDetectGemini = !rawProvider || explicitProvider === "gemini";

  if (explicitProvider === "gemini" || (autoDetectGemini && (process.env.GEMINI_API_KEY || process.env.GEMINI_BASE_URL || process.env.ANTHROPIC_BASE_URL?.includes("generativelanguage.googleapis.com")))) {
    return {
      provider: "gemini",
      baseURL: process.env.GEMINI_BASE_URL ?? process.env.ANTHROPIC_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta",
      apiKey: process.env.GEMINI_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? "",
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    };
  }

  return {
    provider: "anthropic",
    baseURL: process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com",
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
  };
}
