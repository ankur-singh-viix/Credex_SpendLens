import type { AuditFormState, AuditSummary, AuditRecord } from "@/types";

// In-memory store for Feature 2 — replaced by Supabase in Feature 5
const store = new Map<string, AuditRecord>();

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
  store.set(id, record);
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  return store.get(id) ?? null;
}

export async function auditExists(id: string): Promise<boolean> {
  return store.has(id);
}