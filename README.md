# SpendLens — Free AI Tool Spend Audit

SpendLens is a free web app for startup founders and engineering managers to audit their AI tool spend. Enter what your team pays for Cursor, Claude, ChatGPT, Copilot and more — get an instant breakdown of where you're overspending and exactly how much you can save.

Built as a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

## Screenshots

> Add 3 screenshots or a Loom link here before submission

<!-- 
![Landing page](./docs/screenshot-landing.png)
![Audit results](./docs/screenshot-results.png)
![Shareable card](./docs/screenshot-share.png)
-->

🎥 [Screen recording — Loom link here]

## Live URL

> https://your-app.vercel.app ← replace this

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spendlens.git
cd spendlens
cp .env.example .env.local
# Fill in .env.local — see .env.example for required keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. https://spendlens.vercel.app) |

### Run tests

```bash
npm run test
```

### Run lint + typecheck

```bash
npm run lint
npx tsc --noEmit
```

## Decisions

1. **Next.js 14 App Router over Pages Router** — Server components let the audit engine and Anthropic API calls run server-side only. No risk of leaking API keys to the client. Edge-compatible for future scaling.

2. **Hardcoded rules for audit math, LLM only for the summary paragraph** — LLMs hallucinate pricing. The savings calculation is a deterministic rule engine; the AI only writes the prose wrapper around real numbers. This is the right split: predictable where it matters, generative where it adds value.

3. **In-memory store with Supabase fallback** — The audit result is written to memory immediately (fast redirect) and persisted to Supabase asynchronously. This means the results page loads instantly even if Supabase is slow, and shareable links survive process restarts.

4. **nanoid slugs instead of UUIDs for shareable URLs** — 10-character nanoid (`abc123xyz0`) is shorter and cleaner in a tweet than a full UUID. Zero collision risk at this scale.

5. **Email captured after value shown, never before** — Every dark-pattern audit tool gates the result behind email. SpendLens shows the full audit first. This is both the ethical choice and the better conversion choice — users who see real savings numbers are far more likely to hand over an email than users who haven't seen anything yet.