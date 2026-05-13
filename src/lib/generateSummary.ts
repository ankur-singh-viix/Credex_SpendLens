import Anthropic from "@anthropic-ai/sdk";
import type { AuditFormState, AuditSummary } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(form: AuditFormState, summary: AuditSummary): string {
  const enabledTools = form.tools.filter((t) => t.enabled);
  const toolLines = enabledTools
    .map((t) => `- ${t.toolId}: ${t.plan}, ${t.seats} seat(s), $${t.monthlySpend}/mo`)
    .join("\n");

  const resultLines = summary.toolResults
    .map(
      (r) =>
        `- ${r.toolName}: ${r.recommendationType} → saves $${r.monthlySavings}/mo. Reason: ${r.reasoning}`
    )
    .join("\n");

  return `You are a no-nonsense AI infrastructure analyst writing a short audit summary for a startup team.

TEAM CONTEXT:
- Team size: ${form.teamSize}
- Primary use case: ${form.useCase}
- Total current AI spend: $${summary.totalCurrentSpend}/mo

TOOLS THEY PAY FOR:
${toolLines}

AUDIT FINDINGS:
${resultLines}

TOTAL SAVINGS FOUND: $${summary.totalMonthlySavings}/mo ($${summary.totalAnnualSavings}/yr)

Write a 80-100 word plain-English summary paragraph for this team. Rules:
- Start with the biggest finding (highest savings or "already optimal")
- Be specific with dollar amounts
- Do NOT use bullet points — prose only
- Do NOT use phrases like "based on our analysis" or "it appears"
- Sound like a smart CFO friend giving frank advice, not a marketing email
- If savings are under $10, tell them honestly their stack looks well-optimised
- End with one concrete next step they should take today`;
}

function buildFallback(form: AuditFormState, summary: AuditSummary): string {
  if (summary.isAlreadyOptimal) {
    return `Your ${form.teamSize}-person team is running a well-optimised AI stack for ${form.useCase} work. At $${summary.totalCurrentSpend}/mo, the plans you've chosen match your team size without paying for features you don't need. Keep an eye on your API spend as usage grows — that's typically where costs balloon first for teams your size.`;
  }

  const topResult = [...summary.toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  return `Your team is spending $${summary.totalCurrentSpend}/mo on AI tools and leaving $${summary.totalMonthlySavings}/mo ($${summary.totalAnnualSavings}/yr) on the table. The biggest win is ${topResult.toolName}: ${topResult.reasoning} Across your full stack, these aren't minor tweaks — this is $${summary.totalAnnualSavings} a year that could go toward headcount or runway. The fastest next step: start with the highest-savings change and book a Credex call if you want help with bulk credits.`;
}

export async function generateAISummary(
  form: AuditFormState,
  summary: AuditSummary
): Promise<string> {
  // Skip API call in test/build environments
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "test_key") {
    return buildFallback(form, summary);
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: buildPrompt(form, summary),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return buildFallback(form, summary);
    }

    return textBlock.text.trim();
  } catch (err) {
    // Graceful fallback on any API error (rate limit, network, etc.)
    console.error("[generateSummary] Anthropic API error, using fallback:", err);
    return buildFallback(form, summary);
  }
}