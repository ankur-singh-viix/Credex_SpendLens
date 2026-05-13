import { describe, it, expect } from "vitest";
import { TOOL_CATALOG, getToolById, getToolPlan } from "../toolCatalog";

describe("toolCatalog", () => {
  it("has exactly 8 tools", () => {
    expect(TOOL_CATALOG).toHaveLength(8);
  });

  it("every tool has at least one plan", () => {
    TOOL_CATALOG.forEach((tool) => {
      expect(tool.plans.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("every plan has a sourceUrl and verifiedDate", () => {
    TOOL_CATALOG.forEach((tool) => {
      tool.plans.forEach((plan) => {
        expect(plan.sourceUrl).toBeTruthy();
        expect(plan.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  it("getToolById returns correct tool", () => {
    const cursor = getToolById("cursor");
    expect(cursor).toBeDefined();
    expect(cursor?.name).toBe("Cursor");
  });

  it("getToolById returns undefined for unknown id", () => {
    expect(getToolById("nonexistent_tool")).toBeUndefined();
  });

  it("getToolPlan returns correct plan", () => {
    const plan = getToolPlan("cursor", "pro");
    expect(plan).toBeDefined();
    expect(plan?.pricePerSeatPerMonth).toBe(20);
  });

  it("Cursor Pro is $20/seat/month", () => {
    const plan = getToolPlan("cursor", "pro");
    expect(plan?.pricePerSeatPerMonth).toBe(20);
  });

  it("GitHub Copilot Business is $19/seat/month", () => {
    const plan = getToolPlan("github_copilot", "business");
    expect(plan?.pricePerSeatPerMonth).toBe(19);
  });

  it("Claude Pro is $20/seat/month", () => {
    const plan = getToolPlan("claude_consumer", "pro");
    expect(plan?.pricePerSeatPerMonth).toBe(20);
  });

  it("Windsurf Pro is $15/seat/month", () => {
    const plan = getToolPlan("windsurf", "pro");
    expect(plan?.pricePerSeatPerMonth).toBe(15);
  });
});
