# add-product

Add a new product recommendation to the mock dataset, properly formatted and validated against the app schema.

## When to invoke

Use this skill when you need to:
- Add a new skincare product to `data/mockRecommendations.json`
- Replace a placeholder product with a real researched one
- Expand the mock dataset to cover more skin profiles

## Schema reference

Every product must match this TypeScript interface (defined in `lib/types.ts`):

```ts
interface ProductRecommendation {
  step: string;        // "Cleanser" | "Toner" | "Serum" | "Moisturizer" | "Sunscreen" | "Eye Cream" | "Essence" | "Treatment"
  productName: string; // exact product name as sold
  brand: string;
  origin: string;      // "Korea" | "Japan" | "USA" | "France" | etc.
  matchReason: string; // 2–3 sentences: why this fits the target skin profile
  keyIngredients: string[];  // 2–5 key actives
  vendors: Vendor[];   // 2–3 retailers with real links
}

interface Vendor {
  name: string;   // retailer name
  price: string;  // "$XX.XX" format
  url: string;    // direct product page URL (not homepage)
}
```

## Steps

1. **Search for the product** using the `tavily` MCP tool:
   - Query: `"<product name> <brand> review ingredients where to buy price"`
   - Verify the product is currently available and in production
   - Confirm ingredient list from the brand's official site or INCI decoder

2. **Find purchase links** — search for the product on at least two of:
   - Amazon, Sephora, Ulta, YesStyle, Stylevana, Olive Young, Cult Beauty, Yesstyle, Dermstore

3. **Write the JSON object** following the schema exactly:
   - `step` must be a valid step name (capitalised, singular)
   - `price` must include the `$` sign
   - `url` must be a direct product page, not a search result

4. **Insert into `data/mockRecommendations.json`** in routine order:
   - Cleanser → Toner → Essence → Serum → Treatment → Eye Cream → Moisturizer → Sunscreen
   - Read the file first, append the new object to the `products` array, write it back

5. **Verify** by running:
   ```bash
   curl -s -X POST http://localhost:3000/api/recommend \
     -H "Content-Type: application/json" \
     -d '{"skinType":"oily","primaryConcern":"acne","budget":"30-60","brandOrigin":"any","routineComplexity":"moderate","avoidIngredients":[],"climate":"temperate","currentRoutine":"basic"}' \
     | jq '.products[].productName'
   ```

## Example output object

```json
{
  "step": "Serum",
  "productName": "Snail Mucin 96% Power Repairing Essence",
  "brand": "COSRX",
  "origin": "Korea",
  "matchReason": "96% snail secretion filtrate intensely repairs the skin barrier and fades acne scars without clogging pores. The lightweight watery texture layers well under moisturizer and suits oily and combination skin.",
  "keyIngredients": ["Snail Secretion Filtrate 96%", "Sodium Hyaluronate", "Betaine"],
  "vendors": [
    { "name": "Amazon", "price": "$25.50", "url": "https://www.amazon.com/dp/B00PBX3L7K" },
    { "name": "Sephora", "price": "$27.00", "url": "https://www.sephora.com/product/cosrx-advanced-snail-96-mucin-power-essence-P447021" },
    { "name": "YesStyle", "price": "$22.40", "url": "https://www.yesstyle.com/en/cosrx-advanced-snail-96-mucin-power-essence-100ml/info.html/pid.1056668380" }
  ]
}
```
