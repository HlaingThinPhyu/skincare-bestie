export interface AIConfig {
  baseURL: string | undefined;
  apiKey: string;
  model: string;
}

export function getAIConfig(): AIConfig {
  if (process.env.USE_NINEROUTER === "true") {
    return {
      baseURL: process.env.NINEROUTER_BASE_URL ?? "http://127.0.0.1:20128",
      apiKey: process.env.NINEROUTER_API_KEY ?? "",
      model: process.env.NINEROUTER_MODEL ?? "kr/claude-sonnet-4.5",
    };
  }
  return {
    baseURL: undefined,
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  };
}
