import type { AuditFormState, AuditSummary, AuditRecord } from "@/types";

// In-memory fallback (used when Supabase env vars not set, e.g. in tests/CI)
const memoryStore = new Map<string, AuditRecord>();

function hasSupabase(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://test.supabase.co"
  );
}

export async function storeAudit(
  id: string,
  formState: AuditFormState,
  summary: AuditSummary
): Promise<void> {
  const record: AuditRecord = {
    id,
    formState,
    summary,
    publicFormState: formState,
    createdAt: new Date().toISOString(),
  };

  // Always write to memory (fast reads for the immediate redirect)
  memoryStore.set(id, record);

  // Also persist to Supabase if configured
  if (hasSupabase()) {
    try {
      const { supabaseAdmin } = await import("./supabase");
      await supabaseAdmin.from("audits").insert({
        id,
        form_state: formState,
        summary,
        created_at: record.createdAt,
      });
    } catch (err) {
      console.error("[storage] Supabase write error:", err);
      // Memory store is the fallback — don't throw
    }
  }
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  // Check memory first (fast, covers same-process requests)
  const memHit = memoryStore.get(id);
  if (memHit) return memHit;

  // Fall back to Supabase (covers cross-process / after restart)
  if (hasSupabase()) {
    try {
      const { supabaseAdmin } = await import("./supabase");
      const { data, error } = await supabaseAdmin
        .from("audits")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;

      const record: AuditRecord = {
        id: data.id,
        formState: data.form_state,
        summary: data.summary,
        publicFormState: data.form_state,
        createdAt: data.created_at,
      };

      // Warm memory cache
      memoryStore.set(id, record);
      return record;
    } catch (err) {
      console.error("[storage] Supabase read error:", err);
      return null;
    }
  }

  return null;
}

export async function auditExists(id: string): Promise<boolean> {
  const record = await getAudit(id);
  return record !== null;
}