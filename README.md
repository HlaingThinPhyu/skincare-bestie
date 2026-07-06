# Skincare Scout

A personalized skincare routine recommender powered by AI and live product research.

## What is this project?

**Skincare Scout** is a full-stack Next.js application (App Router) that delivers personalized skincare product recommendations based on your unique skin profile. Using an interactive filter form, you specify your skin type, concerns, budget, brand preferences, and more. The app then leverages Claude AI with Tavily MCP integration to research real, currently available skincare products and curates a customized routine tailored to your needs.

The results are presented as a clean, interactive dashboard showing each product step with ingredient highlights and direct purchase links.

## Features

- **Smart Filter Form**: 8 interactive filters including skin type, primary concern, budget range, brand origin, routine complexity, ingredients to avoid, climate, and current routine level
- **AI-Powered Recommendations**: Claude AI analyzes your profile and generates personalized product routines
- **Live Product Research**: Tavily MCP integration enables real-time web search for current products and pricing
- **Flexible Data Mode**: Toggle between mock data (instant testing) and live AI recommendations
- **Results Dashboard**: Beautiful step-by-step routine display with product details, key ingredients, and purchase links
- **Caching**: 1-hour cache for API responses to optimize performance
- **Proxy Support**: Optional 9Router proxy support for flexible deployment
- **TypeScript Validation**: Fully typed product and filter schemas

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **AI**: [Claude (Sonnet 4.5)](https://www.anthropic.com/claude)
- **Search**: [Tavily MCP](https://tavily.com/) for live web research
- **Styling**: TailwindCSS 4 + Lucide icons
- **Language**: TypeScript 5, JavaScript
- **Package Manager**: npm/yarn/pnpm/bun

## Project Structure
skincare-bestie/
├── app/
│   ├── page.tsx              # Main client page (filter form + results state)
│   └── api/
│       └── recommend/route.ts # POST handler: filters → Claude + Tavily → JSON response
├── components/
│   ├── FilterForm.tsx         # 8-filter form component
│   └── ResultsDashboard.tsx   # Results display with step cards & vendor links
├── lib/
│   ├── types.ts               # TypeScript interfaces (UserFilters, ProductRecommendation, RoutineResponse)
│   └── aiConfig.ts            # AI config switch (Anthropic vs 9Router proxy)
├── data/
│   └── mockRecommendations.json # Fixture data for mock mode
├── .claude/
│   ├── skills/add-product/    # Skill: research and add real products to mock data
│   └── agents/                # Subagent: product-researcher
├── .mcp.json                  # Tavily MCP server config
├── .env.local                 # Environment variables (gitignored)
└── package.json               # Dependencies & scripts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Tavily API key (for live product search)
- Anthropic API key (for Claude AI, when not using mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/HlaingThinPhyu/skincare-bestie.git](https://github.com/HlaingThinPhyu/skincare-bestie.git)
   cd skincare-bestie

   Install dependencies

    Bash
    npm install
    # or
    yarn install
   
2. **Set up environment variables**
Copy and update .env.local:\n   ```bash
cp .env.example .env.local


Required variables:\n   ```
USE_MOCK_DATA=true              # true = use fixture, false = call Claude
USE_NINEROUTER=false            # true = use 9Router proxy
TAVILY_API_KEY=your_key_here    # Required for live search
ANTHROPIC_API_KEY=your_key_here # Required for Claude (when USE_NINEROUTER=false)
Run the development server

Bash
npm run dev
Open http://localhost:3000 in your browser.

**Quick Test**
Test with mock data (no API keys needed):

Bash
# .env.local
USE_MOCK_DATA=true
Then navigate to the UI and submit a profile.

**Test the API directly:**
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{\n    "skinType": "dry",\n    "primaryConcern": "aging",\n    "budget": "60-100",\n    "brandOrigin": "any",\n    "routineComplexity": "moderate",\n    "avoidIngredients": [],\n    "climate": "cold",\n    "currentRoutine": "basic"\n  }' | jq '.products | length'

  **Development**
**Available Scripts**
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint

## How It Works
1. User fills out the FilterForm with 8 filters (skin type, concern, budget, etc.)
2. Form submits to POST /api/recommend with UserFilters JSON
3. Server checks 1-hour cache; if miss:
   Calls buildSystemPrompt() and buildUserPrompt() to prepare Claude's context
   Sends request to Claude (or 9Router proxy)
   Claude calls Tavily MCP tools to research real products (if enabled)
   Claude returns structured JSON matching RoutineResponse schema
   Response is cached and returned to client
5. ResultsDashboard renders each product as a step card with:
   Product name, brand, origin
   Match reason and key ingredients
   Vendor links with prices

**Environment Variables** 
Variable,Values,Purpose
USE_MOCK_DATA,true | false,"Skip AI, return mock fixture immediately"
USE_NINEROUTER,true | false,Route through local 9Router proxy instead of direct Anthropic
TAVILY_API_KEY,API key string,Enable live web search for products
ANTHROPIC_API_KEY,API key string,Claude API access (when USE_NINEROUTER=false)
