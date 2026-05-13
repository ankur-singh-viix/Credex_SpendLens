import type { AuditFormState } from "@/types";

const STORAGE_KEY = "spendlens_form_state";

export const defaultFormState: AuditFormState = {
  teamSize: 5,
  useCase: "mixed",
  tools: [
    {
      toolId: "cursor",
      plan: "pro",
      seats: 5,
      monthlySpend: 100,
      enabled: false,
    },
    {
      toolId: "github_copilot",
      plan: "business",
      seats: 5,
      monthlySpend: 95,
      enabled: false,
    },
    {
      toolId: "claude_consumer",
      plan: "pro",
      seats: 3,
      monthlySpend: 60,
      enabled: false,
    },
    {
      toolId: "claude_api",
      plan: "api_direct",
      seats: 1,
      monthlySpend: 0,
      enabled: false,
    },
    {
      toolId: "chatgpt_consumer",
      plan: "plus",
      seats: 3,
      monthlySpend: 60,
      enabled: false,
    },
    {
      toolId: "openai_api",
      plan: "api_direct",
      seats: 1,
      monthlySpend: 0,
      enabled: false,
    },
    {
      toolId: "gemini",
      plan: "gemini_advanced",
      seats: 2,
      monthlySpend: 40,
      enabled: false,
    },
    {
      toolId: "windsurf",
      plan: "pro",
      seats: 2,
      monthlySpend: 30,
      enabled: false,
    },
  ],
};

export function loadFormState(): AuditFormState {
  if (typeof window === "undefined") return defaultFormState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFormState;
    const parsed = JSON.parse(raw) as AuditFormState;
    // Merge in any new tools added since last visit
    const existingIds = parsed.tools.map((t) => t.toolId);
    const missingTools = defaultFormState.tools.filter(
      (t) => !existingIds.includes(t.toolId)
    );
    return { ...parsed, tools: [...parsed.tools, ...missingTools] };
  } catch {
    return defaultFormState;
  }
}

export function saveFormState(state: AuditFormState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function clearFormState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
