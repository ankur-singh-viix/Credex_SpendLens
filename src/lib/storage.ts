import type { AuditFormState, AuditSummary, AuditRecord } from "@/types";
import { supabaseAdmin } from "./supabase";

// In-memory fallback — always available
const memoryStore = new Map<string, AuditRecord>();

function hasSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    !!url &&
    url !== "https://test.supabase.co" &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
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

  // Always write to memory first (instant redirect)
  memoryStore.set(id, record);

  // Persist to Supabase if configured
  if (hasSupabase()) {
    try {
      await supabaseAdmin.from("audits").insert({
        id,
        form_state: formState,
        summary,
        created_at: record.createdAt,
      });
    } catch (err) {
      console.error("[storage] Supabase write error:", err);
    }
  }
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  // Check memory first
  const memHit = memoryStore.get(id);
  if (memHit) return memHit;

  // Fall back to Supabase
  if (hasSupabase()) {
    try {
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
  return (await getAudit(id)) !== null;
}