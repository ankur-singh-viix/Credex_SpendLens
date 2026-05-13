"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditRecord, ToolAuditResult, RecommendationType } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  record: AuditRecord;
}

type RecommendationConfig = {
  label: string;
  color: string;
  bg: string;
  icon: string;
};

const RECOMMENDATION_CONFIG: Record<RecommendationType, RecommendationConfig> = {
  downgrade: {
    label: "Downgrade plan",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    icon: "↓",
  },
  switch_tool: {
    label: "Switch tool",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: "⇄",
  },
  credits: {
    label: "Buy via credits",
    color: "text-brand-400",
    bg: "bg-brand-400/10 border-brand-400/20",
    icon: "◈",
  },
  consolidate: {
    label: "Consolidate tools",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    icon: "⊕",
  },
  optimal: {
    label: "Already optimal",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: "✓",
  },
};

export function AuditResults({ record }: Props) {
  const { summary } = record;
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/audit/${record.id}`
      : `/audit/${record.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(13,184,150,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(13,184,150,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        <nav className="border-b border-surface-3/50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-brand-400 text-xl">◈</span>
              <span className="font-bold text-lg tracking-tight">SpendLens</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-[#6b8c82] hover:text-brand-400 transition-colors"
            >
              ← Run new audit
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

          {/* Hero savings card */}
          <div
            className={cn(
              "rounded-2xl p-8 border text-center animate-fade-up",
              summary.isAlreadyOptimal
                ? "bg-emerald-500/5 border-emerald-500/20"
                : summary.hasHighSavings
                ? "bg-brand-500/10 border-brand-500/30 brand-glow"
                : "bg-surface-1 border-surface-3"
            )}
          >
            {summary.isAlreadyOptimal ? (
              <>
                <div className="text-5xl mb-4">✓</div>
                <h1 className="text-2xl font-bold text-emerald-400 mb-2">
                  You&apos;re spending well
                </h1>
                <p className="text-[#8aada6] max-w-md mx-auto">
                  Your current AI tool stack is well-matched to your team size and
                  use case. No significant optimisations found.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-brand-400 font-medium uppercase tracking-widest mb-3">
                  Potential savings found
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-6xl sm:text-7xl font-extrabold text-white">
                    ${summary.totalMonthlySavings.toLocaleString()}
                  </span>
                  <span className="text-xl text-[#6b8c82]">/mo</span>
                </div>
                <p className="text-2xl text-brand-400 font-semibold mb-4">
                  ${summary.totalAnnualSavings.toLocaleString()} per year
                </p>
                <p className="text-sm text-[#6b8c82]">
                  That&apos;s{" "}
                  <span className="text-white font-medium">
                    {summary.savingsPercentage}%
                  </span>{" "}
                  of your current ${summary.totalCurrentSpend.toLocaleString()}/mo AI spend
                </p>
              </>
            )}
          </div>

          {/* Credex CTA for high savings */}
          {summary.hasHighSavings && (
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-6 animate-fade-up flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-brand-400 mb-1">
                  Capture even more with Credex
                </p>
                <p className="text-sm text-[#8aada6]">
                  Credex sells discounted AI credits — Cursor, Claude, ChatGPT
                  Enterprise and more — sourced from companies that overforecast.
                  Teams saving ${summary.totalMonthlySavings}+/mo typically unlock
                  an additional 20–30% with credits.
                </p>
              </div>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap flex-shrink-0"
              >
                Book a Credex call →
              </a>
            </div>
          )}

          {/* AI Summary */}
          {summary.aiSummary && (
            <div className="card animate-fade-up">
              <p className="text-xs font-medium text-brand-400 uppercase tracking-widest mb-3">
                ◈ AI-generated summary
              </p>
              <p className="text-[#c8ddd9] leading-relaxed">{summary.aiSummary}</p>
            </div>
          )}

          {/* Per-tool breakdown */}
          <div className="animate-fade-up">
            <h2 className="text-sm font-semibold text-[#6b8c82] uppercase tracking-widest mb-4">
              Per-tool breakdown
            </h2>
            <div className="space-y-3">
              {summary.toolResults.map((result) => (
                <ToolResultCard key={result.toolId} result={result} />
              ))}
            </div>
          </div>

          {/* Spend summary table */}
          <div className="card animate-fade-up">
            <h2 className="text-sm font-semibold text-[#6b8c82] uppercase tracking-widest mb-4">
              Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8aada6]">Current monthly spend</span>
                <span className="font-medium">
                  ${summary.totalCurrentSpend.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8aada6]">Recommended spend</span>
                <span className="font-medium text-brand-400">
                  ${summary.totalRecommendedSpend.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-surface-3" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Monthly savings</span>
                <span className="text-brand-400">
                  ${summary.totalMonthlySavings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Annual savings</span>
                <span className="text-brand-400 text-base">
                  ${summary.totalAnnualSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Optimal CTA */}
          {summary.isAlreadyOptimal && (
            <div className="card text-center animate-fade-up">
              <p className="text-sm text-[#8aada6] mb-4">
                Want a heads-up when new optimisations apply to your stack?
              </p>
              <NotifyForm auditId={record.id} />
            </div>
          )}

          {/* Share + actions */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-up">
            <button
              onClick={handleCopy}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              {copied ? <>✓ Copied!</> : <>⎘ Copy shareable link</>}
            </button>
            <Link href="/" className="btn-secondary flex-1 text-center">
              ← Run another audit
            </Link>
          </div>

          {/* Email gate */}
          {!summary.isAlreadyOptimal && (
            <div className="card border-brand-500/20 animate-fade-up">
              <p className="text-sm font-semibold mb-1">Get this report by email</p>
              <p className="text-xs text-[#6b8c82] mb-4">
                One email with your full audit. No newsletter. Unsubscribe in one click.
              </p>
              <EmailCaptureForm
                auditId={record.id}
                hasHighSavings={summary.hasHighSavings}
              />
            </div>
          )}

          <p className="text-center text-xs text-[#4a6b62] pb-8">
            Powered by{" "}
            <a
              href="https://credex.rocks"
              className="text-brand-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Credex
            </a>
            {" "}· Pricing verified{" "}
            {new Date(record.summary.generatedAt).toLocaleDateString()}
          </p>

        </div>
      </div>
    </main>
  );
}

// ─── Tool result card ──────────────────────────────────────────────────────────

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const config = RECOMMENDATION_CONFIG[result.recommendationType];

  return (
    <div className="card glass-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-sm">{result.toolName}</span>
            <span className="text-xs text-[#6b8c82]">{result.currentPlan}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border font-medium",
                config.bg,
                config.color
              )}
            >
              {config.icon} {config.label}
            </span>
          </div>
          <p className="text-xs text-[#8aada6] leading-relaxed">
            {result.reasoning}
          </p>
          {result.recommendedPlan && result.recommendationType !== "optimal" && (
            <p className="text-xs text-brand-400 mt-1.5 font-medium">
              → Switch to: {result.recommendedTool ?? result.recommendedPlan}
            </p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#6b8c82] mb-0.5">
            ${result.currentMonthlySpend}/mo
          </p>
          {result.monthlySavings > 0 && (
            <>
              <p className="text-sm font-bold text-brand-400">
                −${result.monthlySavings}/mo
              </p>
              <p className="text-xs text-[#6b8c82]">
                −${result.annualSavings}/yr
              </p>
            </>
          )}
          {result.recommendationType === "optimal" && (
            <p className="text-xs text-emerald-400 font-medium">Optimal ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Email capture form ────────────────────────────────────────────────────────

function EmailCaptureForm({
  auditId,
  hasHighSavings,
}: {
  auditId: string;
  hasHighSavings: boolean;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, companyName: company, role, auditId }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className="text-emerald-400 font-medium mb-1">✓ Report sent!</p>
        <p className="text-xs text-[#6b8c82]">
          {hasHighSavings
            ? "We'll also reach out about capturing more savings via Credex."
            : "We'll notify you when new optimisations apply to your stack."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="_hp"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field sm:col-span-1"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Sending…" : "Send me this report →"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

// ─── Notify form ──────────────────────────────────────────────────────────────

function NotifyForm({ auditId }: { auditId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="text-emerald-400 text-sm font-medium">
        ✓ You&apos;re on the list!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-field flex-1"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="btn-primary whitespace-nowrap"
      >
        {status === "loading" ? "…" : "Notify me"}
      </button>
    </form>
  );
}