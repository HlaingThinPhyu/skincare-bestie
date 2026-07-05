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

You MUST use the Tavily search tool to find:
1. Currently available products matching the user's criteria
2. Current pricing from major retailers
3. Real product pages and purchase links

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

async function callClaudeAgent(filters: UserFilters): Promise<RoutineResponse> {
  const config = getAIConfig();
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!tavilyKey || tavilyKey === "replace_with_tavily_api_key") {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const client = new Anthropic({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  const response = await (client.beta.messages as any).create({
    model: config.model,
    max_tokens: 8096,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(filters) }],
    mcp_servers: [
      {
        type: "url",
        url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${tavilyKey}`,
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

  // Extract text content from the response
  const textBlock = response.content.find(
    (block: { type: string }) => block.type === "text"
  );
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const parsed: RoutineResponse = JSON.parse(textBlock.text);
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
    return Response.json({ error: message }, { status: 500 });
  }
}
