import { describe, it, expect } from "vitest";

// Test the OG URL generation logic (pure function, no ImageResponse needed)
function buildOgUrl(baseUrl: string, auditId?: string): string {
  if (!auditId) return `${baseUrl}/api/og`;
  return `${baseUrl}/api/og?id=${auditId}`;
}

describe("OG URL generation", () => {
  it("builds default OG URL without id", () => {
    const url = buildOgUrl("https://spendlens.app");
    expect(url).toBe("https://spendlens.app/api/og");
  });

  it("builds audit-specific OG URL with id", () => {
    const url = buildOgUrl("https://spendlens.app", "abc123");
    expect(url).toBe("https://spendlens.app/api/og?id=abc123");
  });

  it("works with localhost", () => {
    const url = buildOgUrl("http://localhost:3000", "xyz789");
    expect(url).toBe("http://localhost:3000/api/og?id=xyz789");
  });
});