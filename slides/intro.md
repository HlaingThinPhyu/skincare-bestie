---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
:root { --bg:#f8fafc; --ink:#0f172a; --muted:#64748b; --accent:#0d9488; --line:#e2e8f0; --code:#0f172a; }
section {
background:var(--bg); color:var(--ink);
font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
font-size:26px; line-height:1.5; padding:48px 64px;
}
h1 { color:var(--ink); font-weight:800; font-size:1.6em; }
h2 { color:var(--accent); font-weight:600; }
h3 { color:var(--muted); font-weight:600; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:none; }
img { border-radius:12px; box-shadow:0 12px 30px rgba(15,23,42,.18); }
code { background:#e6fffb; color:#0f766e; padding:.06em .35em; border-radius:5px; font-family:'JetBrains Mono',monospace; }
pre { background:var(--code); border-radius:10px; }
pre code { background:none; color:#e2e8f0; }
blockquote { border-left:4px solid var(--accent); background:#ecfeff; color:#155e75; padding:.5em 1em; }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover {
background:radial-gradient(800px 360px at 82% 14%, rgba(13,148,136,.18), transparent 60%), var(--bg);
}
section.cover h1 { font-size:2.3em; }
section.cover h2 { color:var(--muted); font-weight:400; }
</style>

<!-- _class: cover -->

# Skincare Bestie

## AI-powered, personalized skincare routines — researched live, not guessed

HlaingThinPhyu · github.com/HlaingThinPhyu/skincare-bestie

---

# What It Is

Skincare Bestie is a full-stack **Next.js** app that turns an 8-question skin profile into a curated, step-by-step skincare routine.

Instead of static, generic advice, it pairs **Claude AI** with **live web research (Tavily MCP)** so every recommendation reflects real, currently available products and pricing.

---

# Who It's For

- Anyone overwhelmed by generic "best products" listicles
- People who want advice matched to *their* skin type, concerns, budget, and climate
- Users who want current, real products with purchase links — not outdated blog picks
- Skincare beginners and routine-builders who want a clear, ordered plan

---

# What It Does

- Collects skin type, concern, budget, brand origin, routine complexity, climate, and more
- Sends the profile to Claude, which researches real products via Tavily
- Returns a step-by-step routine: product, brand, key ingredients, match reason, and vendor links
- Caches results for an hour and supports a mock-data mode for instant demos

---

# How It's Built

```bash
npm install && npm run dev
```

Stack: **Next.js 16 (App Router) · React 19 · TailwindCSS 4 · TypeScript** · Claude AI + Tavily MCP

---

# Try It

- **Live:** skincare-bestie.vercel.app
- **Repo:** github.com/HlaingThinPhyu/skincare-bestie
