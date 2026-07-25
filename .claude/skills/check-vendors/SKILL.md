# check-vendors

Verify vendor URLs returned by a live Tavily product search in real time. Run this after `product-researcher` finds products for a user's skin profile — before writing anything to mock data or returning results to the client.

## When to invoke

Use this skill when:
- `product-researcher` has just returned a `RoutineResponse` JSON from a live Tavily search
- You want to confirm that vendor links are real, reachable, and point to the correct product
- Before saving live search results into `data/mockRecommendations.json`

## Input

Paste the `RoutineResponse` JSON (or just the `products` array) from the live search. Example:
```
/check-vendors
<paste the RoutineResponse JSON here>
```

## Steps

### 1. Extract vendor URLs

Parse the input JSON and build a list of every vendor entry:
```
[product] [step] | [vendor.name] | [vendor.url] | expected product: [productName] [brand]
```

### 2. Verify each URL with Tavily

For each vendor URL, call `mcp__tavily__extract` to fetch the live page:
- Check that the page title or visible text mentions the `productName` or `brand`
- Check that the URL is a direct product page (has a meaningful path, not just the root domain)

**Status:**
- ✅ **Verified** — page loads and mentions product name or brand
- ⚠️ **Mismatch** — page loads but content doesn't match the product (wrong product, category page, or search results)
- ❌ **Dead** — page failed to load, 404, or redirected to homepage

### 3. For mismatched or dead URLs — search for a replacement

Use `mcp__tavily__search` to find the correct direct product page:
```
"[productName] [brand] buy [vendor.name] site:[retailer domain]"
```
Examples:
- `"COSRX Snail 96 Mucin Essence buy Amazon site:amazon.com"`
- `"Biore UV Aqua Sun Gel buy YesStyle site:yesstyle.com"`

Pick the first result that matches the product and is a direct product page.

### 4. Print results table

```
Vendor Verification — Live Search Results
──────────────────────────────────────────────────────────────────────────────
Step         Product                    Vendor      Status       URL
──────────────────────────────────────────────────────────────────────────────
Cleanser     Low pH Gel Cleanser        Amazon      ✅ Verified  https://...
Cleanser     Low pH Gel Cleanser        YesStyle    ⚠️ Mismatch  https://...
Serum        Niacinamide 10% + Zinc     Sephora     ✅ Verified  https://...
──────────────────────────────────────────────────────────────────────────────
Summary: 8 verified, 1 mismatch (replaced), 0 dead
```

For each ⚠️ or ❌, show the proposed replacement URL inline.

### 5. Return corrected JSON

Output the full `RoutineResponse` JSON with all vendor URLs corrected. This is the version safe to return to the client or save to `data/mockRecommendations.json`.
