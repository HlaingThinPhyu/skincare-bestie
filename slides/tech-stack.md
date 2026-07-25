---
marp: true
paginate: true
transition: fade
---

<!-- slide 1: Cover -->
# Your Skin Bestie — Tech Stack

**Chapter 5: Workflow + Capability**
AI-powered skincare routine recommender

---

<!-- slide 2: Tech Stack -->
# Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI model | Claude Sonnet 4.5 (Anthropic SDK) |
| Live search | Tavily MCP (web product lookup) |
| Caching | In-memory (1-hour TTL) |
| Deployment | Vercel |
| Mock data | `data/mockRecommendations.json` |

---

<!-- slide 3: Agents -->
# Agents

### `product-researcher`
`.claude/agents/product-researcher.md`

**What it does:** Given a skin profile (skin type, concern, budget, origin preference), it searches Tavily for real matching products, verifies availability and vendor links, and returns a fully valid `RoutineResponse` JSON ready to drop into mock data or validate the live system.

**Tools available:** `mcp__tavily__search`, `mcp__tavily__extract`, `Read`, `Write`

**How to spawn:**
```
Agent({ subagent_type: "product-researcher",
  prompt: "Skin type: oily, concern: acne, budget $30–$60, brand: Korean" })
```

---

<!-- slide 4: Skills -->
# Skills

### `add-product`
`.claude/skills/add-product/SKILL.md`

**What it does:** Guides through researching a single skincare product via Tavily, validates it against the app schema (`lib/types.ts`), and appends it to `data/mockRecommendations.json` in correct routine order.

**Schema enforced:**
- `step` must be one of: Cleanser, Toner, Essence, Serum, Treatment, Eye Cream, Moisturizer, Sunscreen
- `price` in `"$XX.XX"` format
- `url` must be a direct product page (not homepage)
- 2–5 `keyIngredients` (actives only)

---

<!-- slide 5: Methodology -->
# Methodology

**How AI is woven into the workflow:**

1. **Filter form** — user submits 8 structured filters (no free-text), keeping AI input clean
2. **Cache check** — skip AI if identical request seen in last hour
3. **Claude + Tavily** — Claude reasons about the skin profile; Tavily fetches live product data
4. **Structured output** — Claude returns raw JSON parsed to `RoutineResponse`
5. **Mock toggle** — `USE_MOCK_DATA=true` bypasses AI entirely for fast local dev test
6. **Skills & agents** — used at dev time to curate and expand the mock dataset

> PAL pattern: Prompt → Act (Tavily search) → Loop (validate & refine) → return

---

<!-- slide 6: Trigger + Commands -->
# Trigger + Commands

### Skill trigger
Invoke manually inside Claude Code:
```
/add-product
```
Activates when: adding a new product to `data/mockRecommendations.json`

### Agent trigger
Spawn from Claude Code conversation:
```
Agent({ subagent_type: "product-researcher",
  prompt: "Skin type: dry, concern: aging, budget $60–$100, brand: any" })
```
Activates when: populating or refreshing the mock dataset for a skin profile

### API test command
```bash
curl -s -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"skinType":"dry","primaryConcern":"aging","budget":"60-100",
       "brandOrigin":"any","routineComplexity":"moderate",
       "avoidIngredients":[],"climate":"cold","currentRoutine":"basic"}' \
  | jq '.products | length'
```
