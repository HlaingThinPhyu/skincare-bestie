@AGENTS.md

# Skincare Scout — Project Guide

**Skincare Scout** is a full-stack Next.js 16 app (App Router) that takes structured skin profile filters, calls a Claude agent with Tavily MCP for live product research, and returns a personalized routine as structured JSON rendered in a results dashboard.

## Architecture

```
app/page.tsx              ← Client shell: filter form ↔ results state machine
app/api/recommend/route.ts ← POST handler: mock toggle → cache → Claude + Tavily MCP
components/FilterForm.tsx  ← 8 filters (dropdowns + checkboxes, zero free-text inputs)
components/ResultsDashboard.tsx ← Step cards with ingredient pills + vendor links
lib/types.ts               ← Shared TypeScript types (UserFilters, RoutineResponse, etc.)
lib/aiConfig.ts            ← Config switch: real Anthropic vs 9Router proxy
data/mockRecommendations.json ← Fixture returned when USE_MOCK_DATA=true
```

## Environment

Copy `.env.local` and fill in your keys. Key variables:

| Variable | Purpose |
|---|---|
| `USE_MOCK_DATA` | `true` = skip AI, return fixture immediately |
| `USE_NINEROUTER` | `true` = route through local 9Router proxy |
| `TAVILY_API_KEY` | Required for live MCP product search |
| `ANTHROPIC_API_KEY` | Required when `USE_NINEROUTER=false` |

## Claude Code tooling in this repo

### MCP — `.mcp.json`
Configures the **Tavily SSE MCP server** so Claude Code can search the web while developing. Set your `TAVILY_API_KEY` env var before running `claude` in this directory.

Use it to research a product: ask Claude to search Tavily for `"best hyaluronic acid serum under $40 for dry skin"`.

### Skill — `/add-product`
Invoke with `/add-product` inside Claude Code. Guides you through researching a real product via Tavily and appending it to `data/mockRecommendations.json` with the correct schema.

See: `.claude/skills/add-product/SKILL.md`

### Agent — `product-researcher`
A subagent that receives a skin profile, researches real matching products via Tavily, and outputs a `RoutineResponse` JSON object ready to drop into mock data or validate the live system.

Spawn it from Claude Code: `Agent({ subagent_type: "product-researcher", prompt: "Skin type: dry, concern: aging, budget $60–$100, brand: any" })`

See: `.claude/agents/product-researcher.md`

## Data flow (live mode)

1. User submits `UserFilters` → `POST /api/recommend`
2. Cache miss → `callClaudeAgent(filters)`
3. Claude (`claude-sonnet-4.5` or 9Router model) receives system + user prompt
4. If `ENABLE_TAVILY_MCP=true`: Claude calls Tavily tools to research live products
5. Claude returns raw JSON → parsed to `RoutineResponse`
6. Cached for 1 hour, returned to client
7. `ResultsDashboard` renders step cards

## Common tasks

**Add a product to mock data:** `/add-product`

**Test the API locally:**
```bash
curl -s -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"skinType":"dry","primaryConcern":"aging","budget":"60-100","brandOrigin":"any","routineComplexity":"moderate","avoidIngredients":[],"climate":"cold","currentRoutine":"basic"}' \
  | jq '.products | length'
```

**Switch to live AI:** Set `USE_MOCK_DATA=false` and `USE_NINEROUTER=false` in `.env.local`.

**Refine the Claude prompt:** Edit `buildSystemPrompt()` and `buildUserPrompt()` in `app/api/recommend/route.ts`.
