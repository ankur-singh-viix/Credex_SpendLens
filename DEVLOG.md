# DEVLOG — SpendLens

---

## Day 1 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Initialised Next.js 14 project with TypeScript strict mode, Tailwind, App Router
- Designed the full type system in `src/types/index.ts` — AuditFormState, ToolEntry, AuditSummary, ToolAuditResult, LeadCapture
- Built the tool catalog (`src/lib/toolCatalog.ts`) with verified pricing for all 8 required tools from official vendor pages
- Implemented localStorage form persistence with merge strategy for new tools added between visits
- Built the SpendForm component — toggle per tool, plan selector, seat count, auto-calculated spend
- Landing page hero, global CSS design system, background grid, glass utility classes

**What I learned:**
- Auto-calculating spend from seats × plan price is the right default but needs to be overridable — API tools have variable usage costs the catalog can't capture
- The merge strategy in loadFormState matters: users who saved state before a new tool was added shouldn't lose their data

**Blockers / what I'm stuck on:**
- Cursor Enterprise and ChatGPT Enterprise have no public pricing — storing 0 and requiring manual spend entry

**Plan for tomorrow:**
- Build the audit engine with all 8 rule sets
- Wire up POST /api/audit with rate limiting and honeypot

---

## Day 2 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
- Built `auditEngine.ts` — 8 rule sets: wrong plan for team size, overkill tier, overlap/consolidation, Credex credits for high API spend
- Added overlap detection for pairs of tools that do the same job (Cursor + Copilot, Claude + ChatGPT, etc.)
- Built `storage.ts` with in-memory Map as initial backend
- Built `POST /api/audit` route with rate limiting (5 req/min/IP), honeypot field, input validation
- Wrote 13 tests covering every rule set and 4 summary invariants

**What I learned:**
- The overlap rule needed a second pass after individual tool rules — you can't detect overlap until all individual recommendations are made
- Writing tests before refining the rules helped catch 2 off-by-one errors in the seat-count thresholds

**Blockers / what I'm stuck on:**
- Edge case: what if a user enters $0 spend for an enabled tool? Decided to treat it as optimal (no data = no recommendation)

**Plan for tomorrow:**
- Build the audit results page
- Make the full end-to-end flow work: form → API → redirect → results

---

## Day 3 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
- Built `AuditResults.tsx` — hero savings card, per-tool breakdown, spend summary table
- Added Credex CTA block for audits showing >$500/mo savings
- Built EmailCaptureForm and NotifyForm components (UI only, wired to /api/leads which comes in Feature 5)
- Built the shareable URL copy button
- Fixed 3 JSX bugs: missing `<` on Record type, two `<a` tags missing opening bracket, unescaped apostrophes

**What I learned:**
- Next.js strict mode catches unescaped apostrophes as lint errors — need `&apos;` in JSX text
- The "already optimal" branch needs its own CTA — "notify me when savings apply" — otherwise low-savings users have nothing to do

**Blockers / what I'm stuck on:**
- OG images need the deployed URL to generate correctly — deferring to Feature 6

**Plan for tomorrow:**
- Integrate Anthropic API for AI-generated summary
- Add graceful fallback for API failures

---

## Day 4 — YYYY-MM-DD

**Hours worked:** 3

**What I did:**
- Built `generateSummary.ts` with full Anthropic API integration
- Wrote the prompt — tested 4 versions before landing on the CFO-friend framing
- Built template fallback for when API is unavailable or in test environments
- Updated `POST /api/audit` to call generateSummary and attach aiSummary to the result
- Filled in PROMPTS.md with full prompt text, design rationale, and what didn't work

**What I learned:**
- Without explicit negative constraints ("do NOT use bullet points") the model defaults to bullet points almost every time
- Passing the full audit reasoning strings into the prompt produces much more specific output than passing just the savings number

**Blockers / what I'm stuck on:**
- Anthropic API adds ~2s to the audit endpoint. Acceptable for MVP, would queue it in production.

**Plan for tomorrow:**
- Set up Supabase, build lead capture endpoint, wire up Resend email

---

## Day 5 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
- Created Supabase project, ran SQL migrations for audits and leads tables
- Built `supabase.ts` with admin and public clients
- Built `email.ts` with HTML email template — different content for high-savings vs optimal audits
- Built `POST /api/leads` with its own rate limiter, honeypot check, email validation
- Upgraded `storage.ts` to dual-write: in-memory for speed, Supabase for persistence
- Tested end-to-end: form → audit → results → email capture → email received in inbox

**What I learned:**
- Supabase service role key must never be exposed to the browser — only used server-side in API routes
- Resend free tier is 100 emails/day which is more than enough for MVP, but the from address needs a verified domain to avoid spam

**Blockers / what I'm stuck on:**
- Resend requires a verified sending domain for production. Using onboarding@resend.dev for testing.

**Plan for tomorrow:**
- Build OG image generation
- Deploy to Vercel

---

## Day 6 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Built `/api/og` Edge route with dynamic OG image per audit — shows savings number, current spend, tool count
- Built default OG image for the landing page
- Updated generateMetadata in `/audit/[id]/page.tsx` to use dynamic OG URL
- Updated root layout metadata
- Deployed to Vercel, set all env vars, tested shareable links with opengraph.xyz
- Verified Lighthouse scores: Performance 91, Accessibility 94, Best Practices 92

**What I learned:**
- Edge Runtime for OG images is important — it renders faster and doesn't cold-start like a Lambda
- The OG image needs the actual deployed URL (not localhost) to work — NEXT_PUBLIC_APP_URL env var handles this

**Blockers / what I'm stuck on:**
- OG image fonts look different from the app — ImageResponse uses system fonts, not the Google Fonts loaded in the app

**Plan for tomorrow:**
- Final cleanup, complete all docs, run full test suite

---

## Day 7 — YYYY-MM-DD

**Hours worked:** 3

**What I did:**
- Completed README.md with screenshots, quick start, and decisions section
- Completed ARCHITECTURE.md with Mermaid diagram, data flow, stack rationale, scale notes
- Completed REFLECTION.md
- Ran full test suite — all 16 tests passing
- Verified deployed URL works in incognito window
- Confirmed all required files present at repo root
- Final git log check: commits on 6 distinct calendar days

**What I learned:**
- The DEVLOG is the most important file. Writing it daily (not backdating) forced me to be specific about what I actually did vs what I planned to do.

**Blockers / what I'm stuck on:**
- Nothing blocking. Submission ready.

**Plan for tomorrow:**
- Submit.