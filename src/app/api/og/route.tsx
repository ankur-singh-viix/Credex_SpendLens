import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getAudit } from "@/lib/storage";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Default OG image if no ID
  if (!id) {
    return defaultOG();
  }

  const record = await getAudit(id);
  if (!record) return defaultOG();

  const { summary } = record;
  const hasSavings = summary.totalMonthlySavings > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0e0d",
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(13,184,150,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,184,150,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "rgba(13,184,150,0.07)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <span style={{ color: "#0db896", fontSize: "28px" }}>◈</span>
          <span
            style={{ color: "white", fontSize: "22px", fontWeight: "700" }}
          >
            SpendLens
          </span>
          <span
            style={{
              color: "#4a6b62",
              fontSize: "14px",
              marginLeft: "8px",
              marginTop: "4px",
            }}
          >
            Free AI Spend Audit
          </span>
        </div>

        {/* Main content */}
        {hasSavings ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <p
              style={{
                color: "#6b8c82",
                fontSize: "18px",
                margin: "0 0 12px",
                textTransform: "uppercase",
                letterSpacing: "3px",
                fontWeight: "600",
              }}
            >
              Potential savings found
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "96px",
                  fontWeight: "800",
                  lineHeight: 1,
                }}
              >
                ${summary.totalMonthlySavings.toLocaleString()}
              </span>
              <span style={{ color: "#6b8c82", fontSize: "28px" }}>/mo</span>
            </div>
            <p
              style={{
                color: "#0db896",
                fontSize: "32px",
                fontWeight: "600",
                margin: "0 0 32px",
              }}
            >
              ${summary.totalAnnualSavings.toLocaleString()} per year
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "40px" }}>
              <div
                style={{
                  background: "rgba(13,184,150,0.08)",
                  border: "1px solid rgba(13,184,150,0.2)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ color: "#6b8c82", fontSize: "13px" }}>
                  Current spend
                </span>
                <span
                  style={{
                    color: "white",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  ${summary.totalCurrentSpend.toLocaleString()}/mo
                </span>
              </div>
              <div
                style={{
                  background: "rgba(13,184,150,0.08)",
                  border: "1px solid rgba(13,184,150,0.2)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ color: "#6b8c82", fontSize: "13px" }}>
                  Savings
                </span>
                <span
                  style={{
                    color: "#0db896",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  {summary.savingsPercentage}% reduction
                </span>
              </div>
              <div
                style={{
                  background: "rgba(13,184,150,0.08)",
                  border: "1px solid rgba(13,184,150,0.2)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ color: "#6b8c82", fontSize: "13px" }}>
                  Tools audited
                </span>
                <span
                  style={{
                    color: "white",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  {summary.toolResults.length} tools
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: "72px",
                marginBottom: "24px",
                lineHeight: 1,
              }}
            >
              ✓
            </div>
            <p
              style={{
                color: "#34d399",
                fontSize: "48px",
                fontWeight: "800",
                margin: "0 0 16px",
                lineHeight: 1.1,
              }}
            >
              Already optimised
            </p>
            <p
              style={{
                color: "#8aada6",
                fontSize: "22px",
                margin: 0,
              }}
            >
              This AI stack is well-matched to its team. No waste found.
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: "32px",
            borderTop: "1px solid #1a2420",
          }}
        >
          <span style={{ color: "#4a6b62", fontSize: "14px" }}>
            spendlens.app · Free AI spend audit
          </span>
          <span style={{ color: "#4a6b62", fontSize: "14px" }}>
            Powered by Credex
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function defaultOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0e0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(13,184,150,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,184,150,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <span style={{ color: "#0db896", fontSize: "64px", marginBottom: "24px" }}>◈</span>
        <p style={{ color: "white", fontSize: "52px", fontWeight: "800", margin: "0 0 16px", textAlign: "center" }}>
          SpendLens
        </p>
        <p style={{ color: "#8aada6", fontSize: "24px", margin: "0 0 40px", textAlign: "center" }}>
          Find out if you&apos;re overpaying for AI tools
        </p>
        <div style={{ background: "#0db896", color: "white", padding: "16px 36px", borderRadius: "10px", fontSize: "20px", fontWeight: "600" }}>
          Run your free audit →
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}