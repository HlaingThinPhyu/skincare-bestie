# pre-deploy

Run a pre-deploy checklist before pushing or merging the skincare-bestie project. Catches lint errors, build failures, invalid mock data, and missing environment variables before they reach Vercel.

## When to invoke

Use this skill before:
- Pushing a branch or opening a PR
- Deploying to Vercel manually
- Merging any change that touches `data/mockRecommendations.json`, `app/api/`, or `lib/`

## Steps

### 1. Lint check
```bash
npm run lint
```
**Pass:** no output / exit 0  
**Fail:** fix all reported ESLint errors before continuing — do not skip with `// eslint-disable`

---

### 2. Build check
```bash
npm run build
```
**Pass:** `✓ Compiled successfully`  
**Fail:** TypeScript errors or Next.js compile errors must be resolved. Common issues:
- Missing type annotations on new props
- Import of a removed or renamed export
- Invalid use of server/client component APIs

---

### 3. Mock data schema check

Read `data/mockRecommendations.json` and verify every product passes all rules:

**Required fields** — each product must have all of:
`step`, `productName`, `brand`, `origin`, `matchReason`, `keyIngredients`, `vendors`

**`step` must be one of:**
`Cleanser` | `Toner` | `Essence` | `Serum` | `Treatment` | `Eye Cream` | `Moisturizer` | `Sunscreen`

**`vendors`** — each entry must have:
- `name` — non-empty string
- `price` — matches pattern `$XX.XX` (dollar sign + digits + dot + two digits)
- `url` — starts with `https://` and is not a homepage (must have a path beyond the domain)

**`keyIngredients`** — array with 2–5 items

**`matchReason`** — at least 2 sentences (contains at least one period followed by a capital letter)

Report each violation as: `[product index] [field] — <reason>`

---

### 4. Environment variable check

Read `.env.local` (if it exists) and verify at least one of these is set:
- `USE_MOCK_DATA=true` — safe; no API key needed
- `ANTHROPIC_API_KEY=<non-empty>` — required for live Anthropic mode
- `GEMINI_API_KEY=<non-empty>` — required for live Gemini mode
- `NINEROUTER_API_KEY=<non-empty>` — required for 9Router proxy mode

If `.env.local` is missing entirely, warn: "No .env.local found — live AI calls will fail unless environment variables are set in Vercel dashboard."

---

### 5. Final report

Print a summary table:

```
Pre-deploy check results
─────────────────────────────────────────
✅ Lint          passed
✅ Build         passed
✅ Mock schema   5/5 products valid
✅ Env vars      ANTHROPIC_API_KEY present
─────────────────────────────────────────
Ready to deploy.
```

If any check fails, print `❌` for that row and a one-line fix hint. Do not report "Ready to deploy" until all checks pass.
