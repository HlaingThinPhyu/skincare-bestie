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

If Tavily search tools are available, use them to find:
1. Currently available products matching the user's criteria
2. Current pricing from major retailers
3. Real product pages and purchase links

If tools are unavailable, provide the best possible recommendation based on your existing knowledge and clearly keep the response grounded in realistic, widely available products.

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
- All vendors must have real URLs to actual product listings
- Prices must be accurate and current
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

  const avoid =
    filters.avoidIngredients.length > 0
      ? filters.avoidIngredients.join(", ")
      : "none";

  return `Please research and recommend a skincare routine for this profile:

- Skin type: ${filters.skinType}
- Primary concern: ${filters.primaryConcern}
- Budget: ${budgetMap[filters.budget]}
- Preferred brand origin: ${filters.brandOrigin === "any" ? "no preference" : filters.brandOrigin}
- Routine complexity: ${complexityMap[filters.routineComplexity]}
- Ingredients to avoid: ${avoid}
- Climate: ${filters.climate}
- Current routine level: ${filters.currentRoutine}

Search for real products with current pricing and purchase links. Return only the JSON object.`;
}

function extractClaudeTextResponse(response: unknown): string {
  const maybeResponse = response as {
    content?: unknown;
    text?: string;
    output_text?: string;
    error?: unknown;
    message?: { content?: unknown };
  };

  const contentBlocks = Array.isArray(maybeResponse?.content)
    ? maybeResponse.content
    : [];

  for (const block of contentBlocks) {
    if (typeof block === "object" && block !== null) {
      const candidate = block as { type?: string; text?: string; content?: unknown };
      if (typeof candidate.text === "string" && candidate.text.trim()) {
        return candidate.text;
      }
      if (typeof candidate.content === "string" && candidate.content.trim()) {
        return candidate.content;
      }
    }
  }

  if (typeof maybeResponse?.text === "string" && maybeResponse.text.trim()) {
    return maybeResponse.text;
  }

  if (typeof maybeResponse?.output_text === "string" && maybeResponse.output_text.trim()) {
    return maybeResponse.output_text;
  }

  if (maybeResponse?.message && typeof maybeResponse.message === "object") {
    const nested = maybeResponse.message as { content?: unknown };
    if (typeof nested.content === "string" && nested.content.trim()) {
      return nested.content;
    }
  }

  if (maybeResponse?.error) {
    throw new Error(
      typeof maybeResponse.error === "string"
        ? maybeResponse.error
        : "Provider returned an error response"
    );
  }

  return "";
}

async function callClaudeAgent(filters: UserFilters): Promise<RoutineResponse> {
  const config = getAIConfig();
  if (!config.apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const enableMcpTools = process.env.USE_NINEROUTER === "true" && Boolean(
    tavilyApiKey && process.env.ENABLE_TAVILY_MCP === "true"
  );

  const client = new Anthropic({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  const requestPayload: Record<string, unknown> = {
    model: config.model,
    max_tokens: 8096,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(filters) }],
  };

  if (enableMcpTools) {
    Object.assign(requestPayload, {
      mcp_servers: [
        {
          type: "url",
          url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${tavilyApiKey}`,
          name: "tavily",
        },
      ],
      tools: [
        {
          type: "mcp_toolset",
          mcp_server_name: "tavily",
        },
      ],
      betas: ["mcp-client-2025-11-20"],
    });
  }

  const messagesClient = (client as any).messages ?? (client as any).beta?.messages;
  if (!messagesClient?.create) {
    throw new Error("Anthropic messages API is unavailable");
  }

  let response;
  try {
    response = await messagesClient.create(requestPayload);
  } catch (error) {
    const fallbackPayload = { ...requestPayload };
    delete fallbackPayload.mcp_servers;
    delete fallbackPayload.tools;
    delete fallbackPayload.betas;

    if (enableMcpTools && error instanceof Error && /tool use|request body|invalid/i.test(error.message)) {
      response = await messagesClient.create(fallbackPayload);
    } else {
      throw error;
    }
  }

  const responseText = extractClaudeTextResponse(response);
  if (!responseText) {
    throw new Error("No text response from Claude");
  }

  let parsed: RoutineResponse;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Invalid JSON response from Claude");
  }

  return parsed;
}

export async function POST(request: Request): Promise<Response> {
  let filters: UserFilters;
  try {
    filters = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate required fields
  if (!filters.skinType || !filters.primaryConcern || !filters.budget) {
    return Response.json({ error: "Missing required filter fields" }, { status: 400 });
  }

  // Return mock data if toggle is enabled
  if (process.env.USE_MOCK_DATA === "true") {
    await new Promise((r) => setTimeout(r, 1200)); // simulate latency
    return Response.json(mockData);
  }

  // Check cache
  const cacheKey = makeCacheKey(filters);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json(cached.data);
  }

  try {
    const result = await callClaudeAgent(filters);
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Recommendation generation failed", err);

    if (process.env.USE_MOCK_DATA === "true" || process.env.FALLBACK_TO_MOCK_ON_ERROR === "true") {
      return Response.json(mockData);
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
