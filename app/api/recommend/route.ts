import Anthropic from "@anthropic-ai/sdk";
import { getAIConfig } from "@/lib/aiConfig";
import type { UserFilters, RoutineResponse } from "@/lib/types";
import mockData from "@/data/mockRecommendations.json";

interface CacheEntry {
  data: RoutineResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function makeCacheKey(filters: UserFilters): string {
  const sorted = Object.entries(filters)
    .map(([k, v]) => `${k}:${Array.isArray(v) ? [...v].sort().join("+") : v}`)
    .sort()
    .join("|");
  return sorted;
}

function buildSystemPrompt(): string {
  return `You are an expert skincare consultant with deep knowledge of cosmetic ingredients and Korean, Japanese, European, and American beauty brands.

Your task: research real, currently available skincare products and recommend a personalized routine.

Return your response as a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "products": [
    {
      "step": "Cleanser|Toner|Serum|Moisturizer|Sunscreen|Eye Cream|Essence|Treatment",
      "productName": "exact product name",
      "brand": "brand name",
      "origin": "Korea|Japan|USA|France|UK|Germany|...",
      "matchReason": "2-3 sentences explaining why this product matches the user's specific profile",
      "keyIngredients": ["ingredient1", "ingredient2", "ingredient3"],
      "vendors": [
        {"name": "retailer name", "price": "$XX.XX", "url": "https://actual-product-url"}
      ]
    }
  ],
  "disclaimer": "brief disclaimer about product recommendations"
}

Guidelines:
- Include 3-7 products depending on the requested routine complexity
- Match products strictly to the user's skin type, concern, budget, and ingredient restrictions
- Return ONLY the JSON object, no other text`;
}

function buildUserPrompt(filters: UserFilters): string {
  const budgetMap: Record<string, string> = {
    "under-30": "under $30 per product",
    "30-60": "$30–$60 per product",
    "60-100": "$60–$100 per product",
    "over-100": "over $100 per product (luxury/prestige)",
  };

  const complexityMap: Record<string, string> = {
    minimal: "minimal (3 steps: cleanser, moisturizer, sunscreen)",
    moderate: "moderate (5 steps)",
    full: "full routine (6-7 steps)",
  };

  const avoid = filters.avoidIngredients.length > 0 ? filters.avoidIngredients.join(", ") : "none";

  return `Please research and recommend a skincare routine for this profile:

- Skin type: ${filters.skinType}
- Primary concern: ${filters.primaryConcern}
- Budget: ${budgetMap[filters.budget]}
- Preferred brand origin: ${filters.brandOrigin === "any" ? "no preference" : filters.brandOrigin}
- Routine complexity: ${complexityMap[filters.routineComplexity]}
- Ingredients to avoid: ${avoid}
- Climate: ${filters.climate}
- Current routine level: ${filters.currentRoutine}

Return only the JSON object.`;
}

function extractJsonObject(text: string): string | null {
  let depth = 0;
  let endIndex = -1;

  for (let i = text.length - 1; i >= 0; i -= 1) {
    const char = text[i];
    if (char === "}") {
      if (endIndex === -1) {
        endIndex = i;
      }
      depth += 1;
    } else if (char === "{") {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && endIndex !== -1) {
          return text.slice(i, endIndex + 1);
        }
      }
    }
  }

  return null;
}

function extractClaudeTextResponse(response: unknown): string {
  const maybeResponse = response as Record<string, unknown> | string | undefined;

  if (typeof maybeResponse === "string" && maybeResponse.trim()) {
    const extracted = extractJsonObject(maybeResponse);
    return extracted ?? maybeResponse;
  }

  if (maybeResponse && typeof maybeResponse === "object") {
    const responseObject = maybeResponse as Record<string, unknown>;

    if (typeof responseObject.content === "string" && responseObject.content.trim()) {
      const extracted = extractJsonObject(responseObject.content);
      return extracted ?? responseObject.content;
    }

    if (Array.isArray(responseObject.content)) {
      for (const block of responseObject.content) {
        if (typeof block === "object" && block !== null) {
          const candidate = block as Record<string, unknown>;
          if (typeof candidate.text === "string" && candidate.text.trim()) {
            const extracted = extractJsonObject(candidate.text);
            return extracted ?? candidate.text;
          }
          if (typeof candidate.content === "string" && candidate.content.trim()) {
            const extracted = extractJsonObject(candidate.content);
            return extracted ?? candidate.content;
          }
        }
      }
    }

    const choiceText = Array.isArray(responseObject.choices)
      ? (responseObject.choices[0] as Record<string, unknown>)?.message as Record<string, unknown> | undefined
      : undefined;
    if (choiceText && typeof choiceText.content === "string" && choiceText.content.trim()) {
      const extracted = extractJsonObject(choiceText.content);
      return extracted ?? choiceText.content;
    }

    const knownTextFields = ["text", "output_text", "response_text", "completion", "answer", "message"];

    for (const field of knownTextFields) {
      const value = responseObject[field];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
      if (typeof value === "object" && value !== null) {
        const nested = value as Record<string, unknown>;
        if (typeof nested.text === "string" && nested.text.trim()) {
          return nested.text;
        }
        if (typeof nested.content === "string" && nested.content.trim()) {
          return nested.content;
        }
      }
    }

    if (Array.isArray(responseObject.choices)) {
      for (const choice of responseObject.choices) {
        if (choice && typeof choice === "object") {
          const choiceObj = choice as Record<string, unknown>;
          const message = choiceObj.message as Record<string, unknown> | undefined;
          if (message) {
            if (typeof message.content === "string" && message.content.trim()) {
                const extracted = extractJsonObject(message.content);
                return extracted ?? message.content;
            }
            if (typeof message.text === "string" && message.text.trim()) {
              return message.text;
            }
          }
          if (typeof choiceObj.text === "string" && choiceObj.text.trim()) {
            return choiceObj.text;
          }
          if (typeof choiceObj.content === "string" && choiceObj.content.trim()) {
            return choiceObj.content;
          }
        }
      }
    }

    if (responseObject.error) {
      const errorValue = responseObject.error;
      if (typeof errorValue === "string") {
        throw new Error(errorValue);
      }
      if (typeof errorValue === "object" && errorValue !== null) {
        const errObj = errorValue as Record<string, unknown>;
        const message = typeof errObj.message === "string" ? errObj.message : JSON.stringify(errObj);
        throw new Error(message);
      }
    }
  }

  return "";
}

function extractGeminiTextResponse(response: unknown): string {
  const maybeResponse = response as Record<string, unknown>;
  const candidates = Array.isArray(maybeResponse?.candidates) ? maybeResponse.candidates : [];

  for (const candidate of candidates) {
    const content = (candidate as Record<string, unknown>)?.content as Record<string, unknown> | undefined;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    for (const part of parts) {
      const text = (part as Record<string, unknown>)?.text;
      if (typeof text === "string" && text.trim()) {
        return text;
      }
    }
  }

  return typeof maybeResponse?.text === "string" ? maybeResponse.text : "";
}

function isRetryableAnthropicError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return /404|not found|model|unsupported|invalid|request body|tool use/i.test(message);
}

function getFallbackModel(model: string): string {
  if (model === "claude-3-5-sonnet-latest") {
    return "claude-sonnet-4-5";
  }
  if (model === "claude-sonnet-4-5") {
    return "claude-3-5-sonnet-latest";
  }
  return "claude-3-5-sonnet-latest";
}

function getGeminiModelCandidates(model: string): string[] {
  return [model, "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"].filter(
    (value, index, array) => value && array.indexOf(value) === index
  );
}

async function callAnthropicHelper(configParam: { provider: string; baseURL: string | undefined; apiKey: string; model: string }, systemPrompt: string, prompt: string, requestTrace: Record<string, unknown>) {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const enableMcpTools = process.env.USE_NINEROUTER === "true" && Boolean(
    tavilyApiKey && process.env.ENABLE_TAVILY_MCP === "true"
  );

  const client = new Anthropic({
    baseURL: configParam.baseURL,
    apiKey: configParam.apiKey,
  });

  const requestPayload: Record<string, unknown> = {
    model: configParam.model,
    max_tokens: 8096,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  };

  if (enableMcpTools) {
    Object.assign(requestPayload, {
      mcp_servers: [{ type: "url", url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${tavilyApiKey}`, name: "tavily" }],
      tools: [{ type: "mcp_toolset", mcp_server_name: "tavily" }],
      betas: ["mcp-client-2025-11-20"],
    });
  }

  requestTrace.requestPayload = requestPayload;

  const typedClient = client as unknown as {
    messages?: { create?: (payload: Record<string, unknown>) => Promise<unknown> };
    beta?: { messages?: { create?: (payload: Record<string, unknown>) => Promise<unknown> } };
  };
  const messagesClient = typedClient.messages ?? typedClient.beta?.messages;
  if (!messagesClient?.create) {
    throw new Error("Anthropic messages API is unavailable");
  }

  const fallbackPayload = { ...requestPayload };
  delete fallbackPayload.mcp_servers;
  delete fallbackPayload.tools;
  delete fallbackPayload.betas;

  const payloadCandidates = enableMcpTools ? [requestPayload, fallbackPayload] : [requestPayload];
  const modelCandidates = [configParam.model, getFallbackModel(configParam.model)].filter(
    (value, index, array) => value && array.indexOf(value) === index
  );

  let response;
  let lastError: unknown;

  for (const model of modelCandidates) {
    for (const payload of payloadCandidates) {
      try {
        response = await messagesClient.create({ ...payload, model });
        break;
      } catch (error) {
        lastError = error;
        if (!isRetryableAnthropicError(error)) {
          throw error;
        }
      }
    }

    if (response) {
      break;
    }
  }

  if (!response) {
    throw lastError ?? new Error("Anthropic request failed");
  }

  const responseText = extractClaudeTextResponse(response);
  requestTrace.response = response;
  if (!responseText) {
    throw new Error("No text response from Claude");
  }

  let parsed: RoutineResponse;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Invalid JSON response from Claude");
  }

  // mark the connection as successful
  try {
    (requestTrace as Record<string, unknown>).connection = {
      connected: true,
      status: 200,
      provider: configParam.provider,
      model: configParam.model,
    };
  } catch (e) {
    // ignore if trace mutation fails
  }

  return { routine: parsed, trace: { ...requestTrace, responseText } };
}

interface ErrorWithTrace extends Error {
  trace?: Record<string, unknown>;
}

async function callClaudeAgent(filters: UserFilters, requestTraceBase: Record<string, unknown> = {}): Promise<{ routine: RoutineResponse; trace: Record<string, unknown> }> {
  const config = getAIConfig();
  const prompt = buildUserPrompt(filters);
  const systemPrompt = buildSystemPrompt();
  const requestTrace: Record<string, unknown> = {
    ...requestTraceBase,
    receivedFilters: filters,
    receivedFiltersJson: JSON.stringify(filters, null, 2),
    provider: config.provider,
    model: config.model,
    baseURL: config.baseURL,
    connection: { connected: false, provider: config.provider, model: config.model },
    request: {
      systemPrompt,
      userPrompts: [prompt],
    },
  };

  if (!config.apiKey) {
    throw new Error(`${config.provider.toUpperCase()} API key is not configured`);
  }

  try {
    if (config.provider === "gemini") {
      const modelCandidates = getGeminiModelCandidates(config.model);
      const attempts: Array<Record<string, unknown>> = [];

      for (const model of modelCandidates) {
        const url = `${config.baseURL}/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
            }),
          });

          const responseText = await response.text();
          let responseBody: unknown = {};
          try {
            responseBody = JSON.parse(responseText);
          } catch {
            responseBody = { raw: responseText };
          }

          attempts.push({ model, status: response.status, ok: response.ok, response: responseBody });

          if (!response.ok) {
            const errorPayload = responseBody as Record<string, unknown>;
            const errorMessage = (errorPayload?.error as Record<string, unknown> | undefined)?.message;
            if (response.status === 404 || response.status === 400 || /not found|unsupported/i.test(String(errorMessage ?? responseText))) {
              continue;
            }
            throw new Error(`Gemini request failed (${response.status}): ${responseText}`);
          }

          const responseContent = extractGeminiTextResponse(responseBody);
          if (!responseContent) {
            throw new Error("No text response from Gemini");
          }

          let parsed: RoutineResponse;
          try {
            parsed = JSON.parse(responseContent);
          } catch {
            throw new Error("Invalid JSON response from Gemini");
          }

          return {
            routine: parsed,
            trace: {
              ...requestTrace,
              attemptedModels: attempts,
              connection: { connected: true, status: 200, provider: config.provider, model },
              responseText: responseContent,
            },
          };
        } catch (error) {
          attempts.push({ model, error: error instanceof Error ? error.message : String(error) });
          if (model === modelCandidates[modelCandidates.length - 1]) {
            throw error;
          }
        }
      }

      // If Gemini failed for all models, try Anthropic as a fallback when possible
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) {
        const anthroConfig = {
          provider: "anthropic",
          baseURL: process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com",
          apiKey: process.env.ANTHROPIC_API_KEY ?? "",
          model: process.env.ANTHROPIC_MODEL?.trim() || getFallbackModel(config.model),
        };

        try {
          const result = await callAnthropicHelper(anthroConfig, systemPrompt, prompt, requestTrace);
          // annotate trace with attempted gemini models
          if (result && result.trace) {
            (result.trace as Record<string, unknown>).attemptedModels = attempts;
            (result.trace as Record<string, unknown>).fallback_from_gemini = true;
          }
          return result;
        } catch (e) {
          attempts.push({ fallbackAnthropicError: e instanceof Error ? e.message : String(e) });
        }
      }

      throw new Error("Gemini request failed for all configured models");
    }

    // For non-Gemini providers call Anthropic helper (or if Gemini fallback reached here)
    return await callAnthropicHelper(config, systemPrompt, prompt, requestTrace);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    requestTrace.error = message;
    const wrappedError = new Error(message) as ErrorWithTrace;
    wrappedError.trace = requestTrace;
    throw wrappedError;
  }
}

export async function POST(request: Request): Promise<Response> {
  let filters: UserFilters;
  try {
    filters = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!filters.skinType || !filters.primaryConcern || !filters.budget) {
    return Response.json({ error: "Missing required filter fields" }, { status: 400 });
  }

  if (process.env.USE_MOCK_DATA === "true") {
    await new Promise((r) => setTimeout(r, 1200));
    return Response.json(mockData);
  }

  const cacheKey = makeCacheKey(filters);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json({ ...cached.data, debug: { cached: true, cacheKey } });
  }

  try {
    const { routine, trace } = await callClaudeAgent(filters);
    cache.set(cacheKey, { data: routine, expiresAt: Date.now() + CACHE_TTL_MS });
    return Response.json({ ...routine, debug: { ...trace, cacheKey } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const debug = err instanceof Error && (err as ErrorWithTrace).trace ? (err as ErrorWithTrace).trace : { error: message };
    console.error("Recommendation generation failed", err);

    if (process.env.FALLBACK_TO_MOCK_ON_ERROR === "true") {
      return Response.json({ ...mockData, debug: { error: message, ...debug } });
    }

    return Response.json({ error: message, debug }, { status: 500 });
  }
}
