import type { ToolCatalogEntry } from "@/types";

// All prices verified from official vendor pricing pages
// See PRICING_DATA.md for full source citations

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    bestFor: ["coding"],
    plans: [
      {
        planId: "hobby",
        planName: "Hobby",
        pricePerSeatPerMonth: 0,
        notes: "2 weeks Pro trial, then free tier with limits",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "pro",
        planName: "Pro",
        pricePerSeatPerMonth: 20,
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "business",
        planName: "Business",
        pricePerSeatPerMonth: 40,
        minSeats: 1,
        notes: "Admin dashboard, SSO, usage analytics",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "enterprise",
        planName: "Enterprise",
        pricePerSeatPerMonth: 0, // custom pricing
        notes: "Custom pricing — contact sales",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    bestFor: ["coding"],
    plans: [
      {
        planId: "individual",
        planName: "Individual",
        pricePerSeatPerMonth: 10,
        sourceUrl: "https://github.com/features/copilot#pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "business",
        planName: "Business",
        pricePerSeatPerMonth: 19,
        sourceUrl: "https://github.com/features/copilot#pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "enterprise",
        planName: "Enterprise",
        pricePerSeatPerMonth: 39,
        sourceUrl: "https://github.com/features/copilot#pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "claude_consumer",
    name: "Claude (Anthropic)",
    category: "chat",
    bestFor: ["writing", "research", "coding", "mixed"],
    plans: [
      {
        planId: "free",
        planName: "Free",
        pricePerSeatPerMonth: 0,
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "pro",
        planName: "Pro",
        pricePerSeatPerMonth: 20,
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "max_5x",
        planName: "Max (5×)",
        pricePerSeatPerMonth: 100,
        notes: "5× usage vs Pro",
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "max_20x",
        planName: "Max (20×)",
        pricePerSeatPerMonth: 200,
        notes: "20× usage vs Pro",
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "team",
        planName: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 5,
        notes: "Min 5 seats, billed annually ($25/seat if annual)",
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "enterprise",
        planName: "Enterprise",
        pricePerSeatPerMonth: 0,
        notes: "Custom pricing",
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "claude_api",
    name: "Anthropic API",
    category: "api",
    bestFor: ["coding", "data", "research", "mixed"],
    plans: [
      {
        planId: "api_direct",
        planName: "API Direct (Pay-as-you-go)",
        pricePerSeatPerMonth: 0,
        notes:
          "Usage-based: Claude Sonnet 4 ~$3/MTok in, $15/MTok out. Enter your actual monthly spend.",
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "chatgpt_consumer",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    bestFor: ["writing", "research", "mixed"],
    plans: [
      {
        planId: "free",
        planName: "Free",
        pricePerSeatPerMonth: 0,
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "plus",
        planName: "Plus",
        pricePerSeatPerMonth: 20,
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "team",
        planName: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 2,
        notes: "$25/seat/mo billed annually",
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "enterprise",
        planName: "Enterprise",
        pricePerSeatPerMonth: 0,
        notes: "Custom pricing",
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    bestFor: ["coding", "data", "research", "mixed"],
    plans: [
      {
        planId: "api_direct",
        planName: "API Direct (Pay-as-you-go)",
        pricePerSeatPerMonth: 0,
        notes:
          "Usage-based: GPT-4o ~$2.50/MTok in, $10/MTok out. Enter your actual monthly spend.",
        sourceUrl: "https://openai.com/api/pricing/",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    bestFor: ["research", "writing", "data", "mixed"],
    plans: [
      {
        planId: "free",
        planName: "Free",
        pricePerSeatPerMonth: 0,
        sourceUrl: "https://one.google.com/about/plans",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "gemini_advanced",
        planName: "Gemini Advanced (Google One AI Premium)",
        pricePerSeatPerMonth: 19.99,
        notes: "Includes 2TB storage + Gemini 1.5 Pro access",
        sourceUrl: "https://one.google.com/about/plans",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "gemini_business",
        planName: "Gemini for Google Workspace Business",
        pricePerSeatPerMonth: 24,
        sourceUrl: "https://workspace.google.com/intl/en/pricing/",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "api",
        planName: "API (Pay-as-you-go)",
        pricePerSeatPerMonth: 0,
        notes: "Free tier available; Gemini 1.5 Pro: $3.50/MTok in",
        sourceUrl: "https://ai.google.dev/pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "coding",
    bestFor: ["coding"],
    plans: [
      {
        planId: "free",
        planName: "Free",
        pricePerSeatPerMonth: 0,
        notes: "Limited completions and flows",
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "pro",
        planName: "Pro",
        pricePerSeatPerMonth: 15,
        notes: "Unlimited completions, 90 flow action credits/mo",
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2025-05-10",
      },
      {
        planId: "teams",
        planName: "Teams",
        pricePerSeatPerMonth: 35,
        minSeats: 5,
        notes: "Centralised billing, admin console",
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2025-05-10",
      },
    ],
  },
];

export const getToolById = (id: string) =>
  TOOL_CATALOG.find((t) => t.id === id);

export const getToolPlan = (toolId: string, planId: string) => {
  const tool = getToolById(toolId);
  return tool?.plans.find((p) => p.planId === planId);
};
