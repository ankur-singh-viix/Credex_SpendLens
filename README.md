# README.md

> ⚠️ This file will be completed on Day 7. See DEVLOG.md for daily progress.

**SpendLens** is a free AI spend audit tool for startup founders and engineering managers. Enter the AI tools your team pays for, get an instant breakdown of where you're overspending, and see exactly how much you could save by switching plans or providers.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spendlens.git
cd spendlens
cp .env.example .env.local
# Fill in .env.local with your keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screenshots

<!-- Add screenshots here on Day 7 -->

## Deployed URL

<!-- Add Vercel URL here -->

## Decisions

1. **Next.js 14 App Router over Pages Router** — Server components let us keep the audit engine and Anthropic API calls server-side, avoiding client-side API key exposure.
2. **TypeScript strict mode** — The audit engine is financial logic; catching type errors at compile time is worth the overhead.
3. **localStorage for form persistence** — No login required, no server round-trip needed. Merge strategy handles new tools added between visits.
4. **Hardcoded rules for audit math, LLM only for prose summary** — LLMs hallucinate pricing. The savings calculation is deterministic; the personalized paragraph is where AI adds value.
5. **nanoid slugs for shareable URLs** — Short, URL-safe, zero collision risk at this scale.
