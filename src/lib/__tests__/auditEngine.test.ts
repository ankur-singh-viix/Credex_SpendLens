import { describe, it, expect } from "vitest";
import { runAudit } from "../auditEngine";
import type { AuditFormState } from "@/types";

function makeForm(overrides: Partial<AuditFormState> = {}): AuditFormState {
  return { teamSize: 5, useCase: "coding", tools: [], ...overrides };
}

describe("auditEngine — empty form", () => {
  it("returns zero savings when no tools enabled", () => {
    const result = runAudit(makeForm());
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.isAlreadyOptimal).toBe(true);
    expect(result.toolResults).toHaveLength(0);
  });
});

describe("auditEngine — downgrade rules", () => {
  it("flags Cursor Business → Pro for teams under 10", () => {
    const form = makeForm({
      teamSize: 4,
      tools: [{ toolId: "cursor", plan: "business", seats: 4, monthlySpend: 160, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "cursor")!;
    expect(r.recommendationType).toBe("downgrade");
    expect(r.recommendedPlan).toBe("Pro");
    expect(r.monthlySavings).toBe(80);
  });

  it("flags Copilot Business → Individual for teams under 5", () => {
    const form = makeForm({
      teamSize: 3,
      tools: [{ toolId: "github_copilot", plan: "business", seats: 3, monthlySpend: 57, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "github_copilot")!;
    expect(r.recommendationType).toBe("downgrade");
    expect(r.recommendedPlan).toBe("Individual");
    expect(r.monthlySavings).toBe(27);
  });

  it("flags Claude Team with fewer than 5 seats → Pro", () => {
    const form = makeForm({
      teamSize: 3,
      tools: [{ toolId: "claude_consumer", plan: "team", seats: 3, monthlySpend: 90, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "claude_consumer")!;
    expect(r.recommendationType).toBe("downgrade");
    expect(r.monthlySavings).toBe(30);
  });

  it("flags Claude Max → Pro", () => {
    const form = makeForm({
      tools: [{ toolId: "claude_consumer", plan: "max_5x", seats: 2, monthlySpend: 200, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "claude_consumer")!;
    expect(r.recommendationType).toBe("downgrade");
    expect(r.monthlySavings).toBe(160);
  });

  it("flags Windsurf Teams under 5 seats → Pro", () => {
    const form = makeForm({
      tools: [{ toolId: "windsurf", plan: "teams", seats: 3, monthlySpend: 105, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "windsurf")!;
    expect(r.recommendationType).toBe("downgrade");
    expect(r.monthlySavings).toBe(60);
  });
});

describe("auditEngine — credits rule", () => {
  it("surfaces Credex credits for high API spend", () => {
    const form = makeForm({
      tools: [{ toolId: "openai_api", plan: "api_direct", seats: 1, monthlySpend: 500, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "openai_api")!;
    expect(r.recommendationType).toBe("credits");
    expect(r.monthlySavings).toBe(100);
  });

  it("does NOT surface credits for low API spend", () => {
    const form = makeForm({
      tools: [{ toolId: "openai_api", plan: "api_direct", seats: 1, monthlySpend: 50, enabled: true }],
    });
    const r = runAudit(form).toolResults.find((r) => r.toolId === "openai_api")!;
    expect(r.recommendationType).toBe("optimal");
  });
});

describe("auditEngine — overlap", () => {
  it("flags Cursor + Copilot overlap", () => {
    const form = makeForm({
      tools: [
        { toolId: "cursor", plan: "pro", seats: 2, monthlySpend: 40, enabled: true },
        { toolId: "github_copilot", plan: "individual", seats: 2, monthlySpend: 20, enabled: true },
      ],
    });
    const types = runAudit(form).toolResults.map((r) => r.recommendationType);
    expect(types).toContain("consolidate");
  });
});

describe("auditEngine — summary invariants", () => {
  it("totalMonthlySavings equals sum of tool savings", () => {
    const form = makeForm({
      teamSize: 3,
      tools: [
        { toolId: "cursor", plan: "business", seats: 3, monthlySpend: 120, enabled: true },
        { toolId: "github_copilot", plan: "business", seats: 3, monthlySpend: 57, enabled: true },
      ],
    });
    const result = runAudit(form);
    const sumFromTools = result.toolResults.reduce((s, r) => s + r.monthlySavings, 0);
    expect(result.totalMonthlySavings).toBe(sumFromTools);
  });

  it("totalAnnualSavings is 12x monthly", () => {
    const form = makeForm({
      tools: [{ toolId: "cursor", plan: "business", seats: 2, monthlySpend: 80, enabled: true }],
    });
    const result = runAudit(form);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("hasHighSavings true when savings >= $500/mo", () => {
    const form = makeForm({
      tools: [{ toolId: "openai_api", plan: "api_direct", seats: 1, monthlySpend: 3000, enabled: true }],
    });
    expect(runAudit(form).hasHighSavings).toBe(true);
  });

  it("isAlreadyOptimal true when savings < $10", () => {
    const form = makeForm({
      tools: [{ toolId: "cursor", plan: "pro", seats: 1, monthlySpend: 20, enabled: true }],
    });
    expect(runAudit(form).isAlreadyOptimal).toBe(true);
  });
});