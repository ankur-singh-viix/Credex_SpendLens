import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendAuditConfirmationEmail } from "@/lib/email";
import { getAudit } from "@/lib/storage";
import type { LeadCapture } from "@/types";

// Basic rate limit for lead endpoint
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 }
    );
  }

  let body: LeadCapture & { _hp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body._hp) {
    return NextResponse.json({ ok: true });
  }

  const { email, companyName, role, teamSize, auditId } = body;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }

  // Get audit for email content
  const auditRecord = await getAudit(auditId);

  // Store lead in Supabase
  const { error: dbError } = await supabaseAdmin.from("leads").insert({
    email,
    company_name: companyName ?? null,
    role: role ?? null,
    team_size: teamSize ?? null,
    audit_id: auditId,
    monthly_savings: auditRecord?.summary.totalMonthlySavings ?? 0,
    annual_savings: auditRecord?.summary.totalAnnualSavings ?? 0,
    has_high_savings: auditRecord?.summary.hasHighSavings ?? false,
    created_at: new Date().toISOString(),
  });

  if (dbError) {
    // Log but don't fail — email is more important than DB insert
    console.error("[leads] Supabase insert error:", dbError.message);
  }

  // Send confirmation email — fail silently if no API key
  if (process.env.RESEND_API_KEY && auditRecord) {
    try {
      await sendAuditConfirmationEmail({
        to: email,
        auditId,
        monthlySavings: auditRecord.summary.totalMonthlySavings,
        annualSavings: auditRecord.summary.totalAnnualSavings,
        hasHighSavings: auditRecord.summary.hasHighSavings,
        toolCount: auditRecord.summary.toolResults.length,
      });
    } catch (emailErr) {
      console.error("[leads] Email send error:", emailErr);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}