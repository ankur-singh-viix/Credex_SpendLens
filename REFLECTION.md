# REFLECTION.md

## 1. Hardest Bug — The Overlap Rule Race Condition

The overlap detection in `auditEngine.ts` was supposed to flag teams paying for both Cursor and GitHub Copilot as redundant. In testing, it wasn't firing even when both were enabled.

My first hypothesis: the `enabledIds` Set wasn't populated correctly. I added a `console.log` — the Set was fine, both IDs were in it. Second hypothesis: the `OVERLAPPING_PAIRS` constant had a typo. Checked it — correct.

Third hypothesis (correct): `applyOverlapPenalties` was only flagging pairs where both tools returned `"optimal"` from the individual audit. But in my test case, one tool was returning `"downgrade"` — so the overlap check skipped it. This was intentional logic I had written and then forgotten.

The fix was to run `applyOverlapPenalties` after all individual audits, but only mutate results that hadn't already been flagged. The real lesson: when a function "isn't firing," check whether its guard clauses are correct before assuming the inputs are wrong.

## 2. A Decision I Reversed — Supabase for Primary Storage

I originally planned to make Supabase the only storage layer — write to it in the API route, read from it in the results page. On Day 5, I realised this created a problem: if Supabase has any latency (cold connection, network blip), the user gets a slow redirect after submitting the form.

I reversed this to a dual-write pattern: always write to the in-memory Map first (instant), then write to Supabase asynchronously. `getAudit()` checks memory first, falls back to Supabase. The results page is always fast because the in-memory write completes before the redirect. The trade-off is that the memory store doesn't survive a process restart — but the Supabase fallback handles that case.

## 3. Week 2 Roadmap

The three things I'd build next, in priority order:

**PDF export** — The results page is already designed to be screenshotted and shared. A one-click PDF would make it shareable to CFOs and finance teams who want a document they can forward. This is a direct conversion lever for Credex consultations.

**Benchmark mode** — "Your team spends $X per developer on AI tools. Companies your size (Y–Z employees) average $W." This requires collecting enough audit data to generate real benchmarks, but even with mocked data it would dramatically increase shareability. "I'm 2× the benchmark" is a tweet.

**Embeddable widget** — A `<script>` tag version of the spend form that bloggers and newsletter writers can embed. Every embed is a distribution channel Credex doesn't have to build. The viral coefficient goes up significantly.

## 4. How I Used AI Tools

I used Claude (Sonnet) throughout the week for specific subtasks:

**What I used it for:** Writing the initial TypeScript type definitions (it's good at exhaustive union types), generating the HTML email template in `email.ts` (tedious inline CSS is exactly what AI is good at), and drafting first versions of the Mermaid diagram in ARCHITECTURE.md.

**What I didn't trust it with:** The audit engine rules. These are financial logic with real dollar amounts attached — I wrote every rule by hand and verified each one against the actual vendor pricing pages. An AI-generated rule that said "downgrade Cursor Business to Pro if team < 5" when the real threshold should be 10 would be wrong in a way that's hard to catch without domain knowledge.

**One time the AI was wrong:** I asked Claude to write the Supabase insert for the leads table. It generated code using `.upsert()` instead of `.insert()`, which would silently overwrite existing lead records if the same email submitted twice. I caught this during code review — the correct behaviour is to always insert a new row so we have a full history of submissions.

## 5. Self-Rating

| Dimension | Score | Reason |
|-----------|-------|--------|
| Discipline | 8/10 | Committed on 6 of 7 days with meaningful messages; Day 3 was lighter than I wanted |
| Code Quality | 7/10 | Types are solid, abstractions are clean; the storage dual-write is slightly over-engineered for MVP |
| Design Sense | 8/10 | The dark green palette is distinctive and the results page hierarchy is clear; mobile could be tighter |
| Problem-Solving | 8/10 | Debugged the overlap bug systematically; the dual-write storage pattern was a good call under pressure |
| Entrepreneurial Thinking | 7/10 | GTM and economics are grounded in real numbers; I wish I'd had more time for the user interviews |