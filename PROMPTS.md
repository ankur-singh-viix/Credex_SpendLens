# PROMPTS.md

## Feature 4 — AI Summary Prompt

### The prompt (exact text sent to the API)

You are a no-nonsense AI infrastructure analyst writing a short audit summary for a startup team.
TEAM CONTEXT:

Team size: {teamSize}
Primary use case: {useCase}
Total current AI spend: ${totalCurrentSpend}/mo

TOOLS THEY PAY FOR:
{toolLines — one line per enabled tool with plan, seats, spend}
AUDIT FINDINGS:
{resultLines — one line per tool with recommendation type, savings, reasoning}
TOTAL SAVINGS FOUND: totalMonthlySavings/mo({totalMonthlySavings}/mo (
totalMonthlySavings/mo({totalAnnualSavings}/yr)
Write a 80-100 word plain-English summary paragraph for this team. Rules:

Start with the biggest finding (highest savings or "already optimal")
Be specific with dollar amounts
Do NOT use bullet points — prose only
Do NOT use phrases like "based on our analysis" or "it appears"
Sound like a smart CFO friend giving frank advice, not a marketing email
If savings are under $10, tell them honestly their stack looks well-optimised
End with one concrete next step they should take today

### Why I wrote it this way

**Role framing ("no-nonsense AI infrastructure analyst")** — Without a strong role, the model defaults to marketing-speak ("we've identified exciting opportunities to optimise..."). The CFO-friend framing reliably produces terse, specific prose.

**Injecting the full audit data** — I pass in the actual tool list, plan names, spend figures, and the engine's reasoning strings. This means the model is summarising real numbers, not hallucinating them. The audit math is done by the deterministic engine; the LLM only writes the prose wrapper.

**Explicit anti-patterns** — "Do NOT use bullet points" and "Do NOT use phrases like based on our analysis" are there because early drafts of the prompt produced exactly those. Negative constraints outperform positive ones for suppressing specific bad habits.

**Word count cap (80-100 words)** — Without a cap the model writes 200+ words. The results page has limited space and the summary should be scanneable.

### What I tried that didn't work

**Asking for JSON output** — First attempt returned `{"summary": "..."}` which is fine, but added parsing complexity with no benefit for a single text field. Switched to plain prose output.

**Shorter prompt without the findings** — Asked the model to summarise just the tool list and savings total. Output was generic ("you could save $X by optimising your tools"). It needs the reasoning strings from the engine to produce specific, credible recommendations.

**Temperature 0** — Outputs were technically correct but robotic. Removed the temperature parameter entirely (defaults to 1.0) — the prose is more natural and still factually grounded by the injected data.

### Fallback behaviour

If the Anthropic API is unavailable (network error, rate limit, missing key), `generateSummary.ts` falls back to a template-generated paragraph built from the same audit data. The fallback is deterministic and always produces readable output. The user never sees an error state for this feature.