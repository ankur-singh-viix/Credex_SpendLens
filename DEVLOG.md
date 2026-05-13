# DEVLOG — SpendLens

---

## Day 1 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Initialised Next.js 14 project with TypeScript, Tailwind, and app router
- Designed core type system (`AuditFormState`, `ToolEntry`, `AuditSummary`, etc.) in `src/types/index.ts`
- Built the full tool catalog (`src/lib/toolCatalog.ts`) with verified pricing for all 8 required tools: Cursor, GitHub Copilot, Claude, Anthropic API, ChatGPT, OpenAI API, Gemini, Windsurf
- Implemented `formPersistence.ts` — localStorage-based state persistence with merge strategy for new tools added between visits
- Built `SpendForm` component: toggle per-tool, plan selector, seat count, monthly spend input with auto-calculation from catalog price × seats
- Landing page hero with animated tagline, social proof strip, and background grid
- Global CSS design system (CSS vars, glass utility class, input-field, card, btn-primary)

**What I learned:**
- Auto-calculating spend from seats × plan price is a UX win but needs to be overridable — API tools especially have variable usage costs that catalog pricing can't capture, so I added a free-input override for those
- `localStorage` merge strategy is important: if I add a new tool later, existing users shouldn't lose their saved state — the merge in `loadFormState` handles that

**Blockers / what I'm stuck on:**
- Need to decide how to handle Cursor Enterprise and ChatGPT Enterprise (custom pricing, no public number). For now storing `pricePerSeatPerMonth: 0` with a "Custom pricing" note and requiring the user to enter their actual spend manually.

**Plan for tomorrow:**
- Build the audit engine (`src/lib/auditEngine.ts`) — the core logic that evaluates each tool and produces `ToolAuditResult[]`
- Add the API route (`/api/audit`) that accepts form state, runs the engine, stores the result, and returns the audit ID
- Set up Supabase schema (or mock storage) so the route works end-to-end

---

## Day 2 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 2 entry here)*

---

## Day 3 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 3 entry here)*

---

## Day 4 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 4 entry here)*

---

## Day 5 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 5 entry here)*

---

## Day 6 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 6 entry here)*

---

## Day 7 — YYYY-MM-DD

**Hours worked:** 0

*(Fill in your Day 7 entry here)*
