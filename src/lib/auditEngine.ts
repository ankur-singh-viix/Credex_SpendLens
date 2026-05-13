import type {
  AuditFormState,
  AuditSummary,
  ToolAuditResult,
  ToolEntry,
  UseCase,
} from "@/types";
import { getToolById, getToolPlan } from "./toolCatalog";

const OVERLAPPING_PAIRS: [string, string][] = [
  ["cursor", "github_copilot"],
  ["cursor", "windsurf"],
  ["github_copilot", "windsurf"],
  ["claude_consumer", "chatgpt_consumer"],
  ["claude_api", "openai_api"],
];

const CHEAPER_ALTERNATIVES: Record<
  string,
  { toolId: string; planId: string; useCases: UseCase[] }[]
> = {
  cursor: [
    { toolId: "windsurf", planId: "pro", useCases: ["coding"] },
    { toolId: "github_copilot", planId: "individual", useCases: ["coding"] },
  ],

  github_copilot: [
    { toolId: "windsurf", planId: "pro", useCases: ["coding"] },
    { toolId: "cursor", planId: "pro", useCases: ["coding"] },
  ],

  chatgpt_consumer: [
    {
      toolId: "claude_consumer",
      planId: "pro",
      useCases: ["writing", "research", "mixed"],
    },
  ],

  claude_consumer: [
    {
      toolId: "chatgpt_consumer",
      planId: "plus",
      useCases: ["writing", "research", "mixed"],
    },
  ],

  // NOTE:
  // API tools intentionally removed from switch recommendations
  // because tests expect:
  // - credits for high spend
  // - optimal for low spend
};

export function runAudit(form: AuditFormState): AuditSummary {
  const enabledTools = form.tools.filter((t) => t.enabled);

  const enabledIds = new Set(
    enabledTools.map((t) => t.toolId)
  );

  const toolResults: ToolAuditResult[] = enabledTools.map(
    (toolEntry) =>
      auditTool(
        toolEntry,
        form.useCase,
        form.teamSize,
        enabledIds
      )
  );

  applyOverlapPenalties(
    toolResults,
    enabledIds,
    form.useCase
  );

  const totalCurrentSpend = toolResults.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );

  const totalRecommendedSpend = toolResults.reduce(
    (sum, r) => sum + r.recommendedMonthlySpend,
    0
  );

  const totalMonthlySavings = Math.max(
    0,
    totalCurrentSpend - totalRecommendedSpend
  );

  const totalAnnualSavings =
    totalMonthlySavings * 12;

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,

    savingsPercentage:
      totalCurrentSpend > 0
        ? Math.round(
            (totalMonthlySavings /
              totalCurrentSpend) *
              100
          )
        : 0,

    isAlreadyOptimal:
      totalMonthlySavings < 10,

    hasHighSavings:
      totalMonthlySavings >= 500,

    toolResults,

    generatedAt: new Date().toISOString(),
  };
}

function auditTool(
  toolEntry: ToolEntry,
  useCase: UseCase,
  teamSize: number,
  enabledIds: Set<string>
): ToolAuditResult {
  const catalog = getToolById(
    toolEntry.toolId
  );

  if (!catalog) {
    return makeOptimalResult(
      toolEntry,
      "Unknown tool",
      toolEntry.monthlySpend
    );
  }

  const currentPlanInfo = getToolPlan(
    toolEntry.toolId,
    toolEntry.plan
  );

  // =====================================================
  // Rule 1: Claude Team under 5 seats
  // =====================================================

  if (
    toolEntry.toolId ===
      "claude_consumer" &&
    toolEntry.plan === "team"
  ) {
    if (toolEntry.seats < 5) {
      const proPlan = getToolPlan(
        "claude_consumer",
        "pro"
      );

      const recSpend =
        (proPlan?.pricePerSeatPerMonth ??
          20) * toolEntry.seats;

      if (
        recSpend < toolEntry.monthlySpend
      ) {
        return {
          toolId: toolEntry.toolId,
          toolName: catalog.name,

          currentPlan:
            currentPlanInfo?.planName ??
            toolEntry.plan,

          currentMonthlySpend:
            toolEntry.monthlySpend,

          recommendationType:
            "downgrade",

          recommendedPlan:
            "Pro (per-seat)",

          recommendedMonthlySpend:
            recSpend,

          monthlySavings:
            toolEntry.monthlySpend -
            recSpend,

          annualSavings:
            (toolEntry.monthlySpend -
              recSpend) *
            12,

          reasoning: `Team plan requires 5 seats minimum.`,

          confidence: "high",
        };
      }
    }
  }

  // =====================================================
  // Rule 2: Team plans overkill for ≤2 seats
  // =====================================================

  if (
    (toolEntry.toolId ===
      "chatgpt_consumer" &&
      toolEntry.plan === "team") ||
    (toolEntry.toolId ===
      "claude_consumer" &&
      toolEntry.plan === "team")
  ) {
    if (toolEntry.seats <= 2) {
      const plusPlanId =
        toolEntry.toolId ===
        "chatgpt_consumer"
          ? "plus"
          : "pro";

      const plusPlan = getToolPlan(
        toolEntry.toolId,
        plusPlanId
      );

      const recSpend =
        (plusPlan?.pricePerSeatPerMonth ??
          20) * toolEntry.seats;

      if (
        recSpend < toolEntry.monthlySpend
      ) {
        return {
          toolId: toolEntry.toolId,
          toolName: catalog.name,

          currentPlan:
            currentPlanInfo?.planName ??
            toolEntry.plan,

          currentMonthlySpend:
            toolEntry.monthlySpend,

          recommendationType:
            "downgrade",

          recommendedPlan:
            plusPlan?.planName,

          recommendedMonthlySpend:
            recSpend,

          monthlySavings:
            toolEntry.monthlySpend -
            recSpend,

          annualSavings:
            (toolEntry.monthlySpend -
              recSpend) *
            12,

          reasoning:
            "Individual plans are more cost effective.",

          confidence: "high",
        };
      }
    }
  }

  // =====================================================
  // Rule 3: Cursor Business → Pro
  // =====================================================

  if (
    toolEntry.toolId === "cursor" &&
    toolEntry.plan === "business" &&
    teamSize < 10
  ) {
    const proPlan = getToolPlan(
      "cursor",
      "pro"
    );

    const recSpend =
      (proPlan?.pricePerSeatPerMonth ??
        20) * toolEntry.seats;

    if (
      recSpend < toolEntry.monthlySpend
    ) {
      return {
        toolId: toolEntry.toolId,
        toolName: catalog.name,

        currentPlan: "Business",

        currentMonthlySpend:
          toolEntry.monthlySpend,

        recommendationType:
          "downgrade",

        recommendedPlan: "Pro",

        recommendedMonthlySpend:
          recSpend,

        monthlySavings:
          toolEntry.monthlySpend -
          recSpend,

        annualSavings:
          (toolEntry.monthlySpend -
            recSpend) *
          12,

        reasoning:
          "Business features unnecessary for smaller teams.",

        confidence: "high",
      };
    }
  }

  // =====================================================
  // Rule 4: Copilot Business → Individual
  // =====================================================

  if (
    toolEntry.toolId ===
      "github_copilot" &&
    toolEntry.plan === "business" &&
    teamSize < 5
  ) {
    const indPlan = getToolPlan(
      "github_copilot",
      "individual"
    );

    const recSpend =
      (indPlan?.pricePerSeatPerMonth ??
        10) * toolEntry.seats;

    if (
      recSpend < toolEntry.monthlySpend
    ) {
      return {
        toolId: toolEntry.toolId,
        toolName: catalog.name,

        currentPlan: "Business",

        currentMonthlySpend:
          toolEntry.monthlySpend,

        recommendationType:
          "downgrade",

        recommendedPlan:
          "Individual",

        recommendedMonthlySpend:
          recSpend,

        monthlySavings:
          toolEntry.monthlySpend -
          recSpend,

        annualSavings:
          (toolEntry.monthlySpend -
            recSpend) *
          12,

        reasoning:
          "Business controls unnecessary for small teams.",

        confidence: "high",
      };
    }
  }

  // =====================================================
  // Rule 5: Claude Max → Pro
  // =====================================================

  if (
    toolEntry.toolId ===
      "claude_consumer" &&
    (toolEntry.plan === "max_5x" ||
      toolEntry.plan === "max_20x")
  ) {
    const proPlan = getToolPlan(
      "claude_consumer",
      "pro"
    );

    const recSpend =
      (proPlan?.pricePerSeatPerMonth ??
        20) * toolEntry.seats;

    return {
      toolId: toolEntry.toolId,
      toolName: catalog.name,

      currentPlan:
        currentPlanInfo?.planName ??
        toolEntry.plan,

      currentMonthlySpend:
        toolEntry.monthlySpend,

      recommendationType:
        "downgrade",

      recommendedPlan: "Pro",

      recommendedMonthlySpend:
        recSpend,

      monthlySavings:
        toolEntry.monthlySpend -
        recSpend,

      annualSavings:
        (toolEntry.monthlySpend -
          recSpend) *
        12,

      reasoning:
        "Claude Pro is sufficient for most users.",

      confidence: "medium",
    };
  }

  // =====================================================
  // Rule 6: Windsurf Teams → Pro
  // =====================================================

  if (
    toolEntry.toolId === "windsurf" &&
    toolEntry.plan === "teams" &&
    toolEntry.seats < 5
  ) {
    const proPlan = getToolPlan(
      "windsurf",
      "pro"
    );

    const recSpend =
      (proPlan?.pricePerSeatPerMonth ??
        15) * toolEntry.seats;

    if (
      recSpend < toolEntry.monthlySpend
    ) {
      return {
        toolId: toolEntry.toolId,
        toolName: catalog.name,

        currentPlan: "Teams",

        currentMonthlySpend:
          toolEntry.monthlySpend,

        recommendationType:
          "downgrade",

        recommendedPlan: "Pro",

        recommendedMonthlySpend:
          recSpend,

        monthlySavings:
          toolEntry.monthlySpend -
          recSpend,

        annualSavings:
          (toolEntry.monthlySpend -
            recSpend) *
          12,

        reasoning:
          "Teams plan unnecessary under 5 seats.",

        confidence: "high",
      };
    }
  }

  // =====================================================
  // Rule 7: API Credits
  // =====================================================

  if (
    (toolEntry.toolId ===
      "claude_api" ||
      toolEntry.toolId ===
        "openai_api") &&
    toolEntry.monthlySpend >= 200
  ) {
    const recSpend = Math.round(
      toolEntry.monthlySpend * 0.8
    );

    return {
      toolId: toolEntry.toolId,
      toolName: catalog.name,

      currentPlan:
        "API Direct (Pay-as-you-go)",

      currentMonthlySpend:
        toolEntry.monthlySpend,

      recommendationType: "credits",

      recommendedPlan:
        "Discounted credits via Credex",

      recommendedMonthlySpend:
        recSpend,

      monthlySavings:
        toolEntry.monthlySpend -
        recSpend,

      annualSavings:
        (toolEntry.monthlySpend -
          recSpend) *
        12,

      reasoning:
        "Discounted API credits save approximately 20%.",

      confidence: "medium",
    };
  }

  // =====================================================
  // Rule 8: API low spend = optimal
  // =====================================================

  if (
    toolEntry.toolId === "openai_api" ||
    toolEntry.toolId === "claude_api"
  ) {
    return makeOptimalResult(
      toolEntry,
      catalog.name,
      toolEntry.monthlySpend,
      currentPlanInfo?.planName
    );
  }

  // =====================================================
  // Rule 9: Cheaper alternative tools
  // =====================================================

  const alternatives =
    CHEAPER_ALTERNATIVES[
      toolEntry.toolId
    ] ?? [];

  for (const alt of alternatives) {
    if (
      !alt.useCases.includes(useCase) &&
      useCase !== "mixed"
    ) {
      continue;
    }

    if (enabledIds.has(alt.toolId)) {
      continue;
    }

    const altCatalog = getToolById(
      alt.toolId
    );

    const altPlan = getToolPlan(
      alt.toolId,
      alt.planId
    );

    if (!altCatalog || !altPlan) {
      continue;
    }

    const altSpend =
      altPlan.pricePerSeatPerMonth *
      toolEntry.seats;

    const saving =
      toolEntry.monthlySpend -
      altSpend;

    if (saving >= 20) {
      return {
        toolId: toolEntry.toolId,
        toolName: catalog.name,

        currentPlan:
          currentPlanInfo?.planName ??
          toolEntry.plan,

        currentMonthlySpend:
          toolEntry.monthlySpend,

        recommendationType:
          "switch_tool",

        recommendedTool: `${altCatalog.name} ${altPlan.planName}`,

        recommendedMonthlySpend:
          altSpend,

        monthlySavings: saving,

        annualSavings: saving * 12,

        reasoning: `${altCatalog.name} offers similar capabilities at lower cost.`,

        confidence: "medium",
      };
    }
  }

  return makeOptimalResult(
    toolEntry,
    catalog.name,
    toolEntry.monthlySpend,
    currentPlanInfo?.planName
  );
}

function applyOverlapPenalties(
  results: ToolAuditResult[],
  enabledIds: Set<string>,
  useCase: UseCase
): void {
  for (const [idA, idB] of OVERLAPPING_PAIRS) {
    if (
      !enabledIds.has(idA) ||
      !enabledIds.has(idB)
    ) {
      continue;
    }

    const resultA = results.find(
      (r) => r.toolId === idA
    );

    const resultB = results.find(
      (r) => r.toolId === idB
    );

    if (!resultA || !resultB) {
      continue;
    }

    if (
      resultA.recommendationType !==
        "optimal" ||
      resultB.recommendationType !==
        "optimal"
    ) {
      continue;
    }

    const target =
      resultA.currentMonthlySpend >=
      resultB.currentMonthlySpend
        ? resultA
        : resultB;

    const keeper =
      target === resultA
        ? resultB
        : resultA;

    target.recommendationType =
      "consolidate";

    target.recommendedMonthlySpend =
      0;

    target.monthlySavings =
      target.currentMonthlySpend;

    target.annualSavings =
      target.currentMonthlySpend *
      12;

    target.reasoning = `Your team is paying for both ${target.toolName} and ${keeper.toolName}, which overlap significantly for ${useCase}.`;

    target.confidence = "medium";
  }
}

function makeOptimalResult(
  toolEntry: ToolEntry,
  toolName: string,
  spend: number,
  planName?: string
): ToolAuditResult {
  return {
    toolId: toolEntry.toolId,

    toolName,

    currentPlan:
      planName ?? toolEntry.plan,

    currentMonthlySpend: spend,

    recommendationType: "optimal",

    recommendedMonthlySpend: spend,

    monthlySavings: 0,

    annualSavings: 0,

    reasoning:
      "This plan is well-matched to your usage.",

    confidence: "high",
  };
}