"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TOOL_CATALOG } from "@/lib/toolCatalog";
import {
  loadFormState,
  saveFormState,
  defaultFormState,
} from "@/lib/formPersistence";
import type { AuditFormState, ToolEntry, UseCase } from "@/types";
import { cn } from "@/lib/utils";

const USE_CASES: { id: UseCase; label: string; emoji: string }[] = [
  { id: "coding", label: "Coding", emoji: "⌨️" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "data", label: "Data / Analytics", emoji: "📊" },
  { id: "research", label: "Research", emoji: "🔍" },
  { id: "mixed", label: "Mixed", emoji: "⚡" },
];

const TOOL_ICONS: Record<string, string> = {
  cursor: "⌥",
  github_copilot: "◎",
  claude_consumer: "◈",
  claude_api: "◈",
  chatgpt_consumer: "○",
  openai_api: "○",
  gemini: "✦",
  windsurf: "≋",
};

export function SpendForm() {
  const router = useRouter();
  const [form, setForm] = useState<AuditFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadFormState();
    setForm(saved);
    setLoaded(true);
  }, []);

  // Persist on every change
  const updateForm = useCallback((updater: (prev: AuditFormState) => AuditFormState) => {
    setForm((prev) => {
      const next = updater(prev);
      saveFormState(next);
      return next;
    });
  }, []);

  const toggleTool = (toolId: string) => {
    updateForm((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.toolId === toolId ? { ...t, enabled: !t.enabled } : t
      ),
    }));
  };

  const updateTool = (toolId: string, field: keyof ToolEntry, value: string | number | boolean) => {
    updateForm((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.toolId === toolId ? { ...t, [field]: value } : t
      ),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const enabledTools = form.tools.filter((t) => t.enabled);

    if (enabledTools.length === 0) {
      newErrors.global = "Enable at least one AI tool to audit.";
    }

    enabledTools.forEach((t) => {
      if (t.seats < 1) {
        newErrors[`${t.toolId}_seats`] = "Min 1 seat";
      }
      if (t.monthlySpend < 0) {
        newErrors[`${t.toolId}_spend`] = "Must be ≥ 0";
      }
    });

    if (form.teamSize < 1) {
      newErrors.teamSize = "Min team size is 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Audit failed");
      const { id } = await res.json() as { id: string };
      router.push(`/audit/${id}`);
    } catch {
      setErrors({ global: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const enabledCount = form.tools.filter((t) => t.enabled).length;
  const totalSpend = form.tools
    .filter((t) => t.enabled)
    .reduce((sum, t) => sum + t.monthlySpend, 0);

  if (!loaded) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-surface-3 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-3 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1 — Team context */}
      <div className="card animate-fade-up">
        <h2 className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-4">
          01 — Your Team
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Team Size</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={form.teamSize}
              onChange={(e) =>
                updateForm((p) => ({
                  ...p,
                  teamSize: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="input-field"
            />
            {errors.teamSize && (
              <p className="text-red-400 text-xs mt-1">{errors.teamSize}</p>
            )}
          </div>
          <div>
            <label className="label">Primary Use Case</label>
            <select
              value={form.useCase}
              onChange={(e) =>
                updateForm((p) => ({ ...p, useCase: e.target.value as UseCase }))
              }
              className="input-field"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.id} value={uc.id}>
                  {uc.emoji} {uc.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2 — Tools */}
      <div className="card animate-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
            02 — Your AI Tools
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            Toggle the tools you pay for
          </span>
        </div>

        <div className="space-y-3">
          {form.tools.map((toolEntry) => {
            const catalog = TOOL_CATALOG.find((t) => t.id === toolEntry.toolId);
            if (!catalog) return null;

            return (
              <ToolRow
                key={toolEntry.toolId}
                toolEntry={toolEntry}
                catalog={catalog}
                errors={errors}
                onToggle={() => toggleTool(toolEntry.toolId)}
                onUpdate={(field, value) =>
                  updateTool(toolEntry.toolId, field, value)
                }
              />
            );
          })}
        </div>
      </div>

      {/* Summary bar */}
      {enabledCount > 0 && (
        <div className="glass rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="text-sm text-[#8aada6]">
            <span className="text-white font-semibold">{enabledCount}</span>{" "}
            tool{enabledCount !== 1 ? "s" : ""} ·{" "}
            <span className="text-white font-semibold">
              ${totalSpend.toLocaleString()}
            </span>
            /mo audited
          </div>
          <div className="text-xs text-brand-400">
            Ready to audit →
          </div>
        </div>
      )}

      {/* Error */}
      {errors.global && (
        <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-3 px-4">
          {errors.global}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || enabledCount === 0}
        className="btn-primary w-full text-base py-4 flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Running your audit…
          </>
        ) : (
          <>
            ◈ Run My Free Audit
            <span className="text-brand-300 text-sm font-normal">— takes ~5 sec</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-[var(--text-muted)]">
        No account needed. Email captured only after you see results.
      </p>
    </form>
  );
}

// ─── Tool Row ──────────────────────────────────────────────────────────────────

interface ToolRowProps {
  toolEntry: ToolEntry;
  catalog: (typeof TOOL_CATALOG)[number];
  errors: Record<string, string>;
  onToggle: () => void;
  onUpdate: (field: keyof ToolEntry, value: string | number | boolean) => void;
}

function ToolRow({ toolEntry, catalog, errors, onToggle, onUpdate }: ToolRowProps) {
  const icon = TOOL_ICONS[toolEntry.toolId] ?? "•";
  const isAPI = toolEntry.toolId === "claude_api" || toolEntry.toolId === "openai_api";

  return (
    <div
      className={cn("tool-card", toolEntry.enabled && "active")}
    >
      {/* Header row — always visible */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150",
            toolEntry.enabled
              ? "bg-brand-500 border-brand-500 text-white"
              : "border-surface-4 bg-surface-2 text-transparent"
          )}
          aria-label={`Toggle ${catalog.name}`}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-brand-400/70 font-mono text-sm w-5 text-center">
          {icon}
        </span>

        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", toolEntry.enabled ? "text-white" : "text-[#6b8c82]")}>
            {catalog.name}
          </p>
        </div>

        {toolEntry.enabled && (
          <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
            ${toolEntry.monthlySpend}/mo
          </span>
        )}
      </div>

      {/* Expanded fields — only when enabled */}
      {toolEntry.enabled && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {/* Plan */}
          <div>
            <label className="label">Plan</label>
            <select
              value={toolEntry.plan}
              onChange={(e) => {
                onUpdate("plan", e.target.value);
                // Auto-set monthly spend from catalog price × seats
                const planInfo = catalog.plans.find((p) => p.planId === e.target.value);
                if (planInfo && planInfo.pricePerSeatPerMonth > 0) {
                  onUpdate("monthlySpend", planInfo.pricePerSeatPerMonth * toolEntry.seats);
                }
              }}
              className="input-field"
            >
              {catalog.plans.map((plan) => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.planName}
                  {plan.pricePerSeatPerMonth > 0
                    ? ` — $${plan.pricePerSeatPerMonth}/seat`
                    : plan.planId === "enterprise" ? " — Custom" : " — Free"}
                </option>
              ))}
            </select>
          </div>

          {/* Seats — hide for API tools */}
          {!isAPI && (
            <div>
              <label className="label">Seats</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={toolEntry.seats}
                onChange={(e) => {
                  const seats = Math.max(1, parseInt(e.target.value) || 1);
                  onUpdate("seats", seats);
                  const planInfo = catalog.plans.find((p) => p.planId === toolEntry.plan);
                  if (planInfo && planInfo.pricePerSeatPerMonth > 0) {
                    onUpdate("monthlySpend", planInfo.pricePerSeatPerMonth * seats);
                  }
                }}
                className={cn("input-field", errors[`${toolEntry.toolId}_seats`] && "border-red-500")}
              />
              {errors[`${toolEntry.toolId}_seats`] && (
                <p className="text-red-400 text-xs mt-1">{errors[`${toolEntry.toolId}_seats`]}</p>
              )}
            </div>
          )}

          {/* Monthly spend */}
          <div className={isAPI ? "col-span-2" : ""}>
            <label className="label">
              {isAPI ? "Monthly Spend ($)" : "Total $/mo"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6b62] text-sm">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={toolEntry.monthlySpend}
                onChange={(e) =>
                  onUpdate("monthlySpend", parseFloat(e.target.value) || 0)
                }
                className={cn(
                  "input-field pl-7",
                  errors[`${toolEntry.toolId}_spend`] && "border-red-500"
                )}
                placeholder="0"
              />
            </div>
            {errors[`${toolEntry.toolId}_spend`] && (
              <p className="text-red-400 text-xs mt-1">{errors[`${toolEntry.toolId}_spend`]}</p>
            )}
          </div>
        </div>
      )}

      {/* Hint for plan notes */}
      {toolEntry.enabled && (() => {
        const planInfo = catalog.plans.find((p) => p.planId === toolEntry.plan);
        return planInfo?.notes ? (
          <p className="mt-2 text-xs text-[#4a6b62]">ℹ {planInfo.notes}</p>
        ) : null;
      })()}
    </div>
  );
}
