---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?

People who want better skincare advice without spending hours researching products.
They need simple, personalized recommendations based on their skin concerns.

---

<!-- slide 2 -->
# Their problem

- Too many skincare products
- Confusing ingredient lists
- Hard to know what actually works
- Generic recommendations don't fit individual needs

---

<!-- slide 3 -->
# What I built

# Skincare Bestie

A web application that helps users discover skincare products and receive personalized recommendations based on their needs, making skincare decisions faster and easier.

---

<!-- slide 4 -->
# How I built it

- MCP: Tavily MCP searches and verifies real skincare products, ingredients, prices, and retailer links.
- Skill: `add-product` validates new skincare recommendations and updates `data/mockRecommendations.json` following the app schema.
- Agent: `product-researcher` researches products for a user's skin profile and generates valid `RoutineResponse` JSON for the app.

---

<!-- slide 5 -->
# Why it matters

Users save time choosing products.
The app makes skincare information easier to understand and encourages informed purchasing decisions through personalized guidance.

---

<!-- slide 6 -->
# Done checklist

- ✅ Public GitHub repository
- ✅ Used MCP, Skill, and Agent
- ✅ Slides and report included
