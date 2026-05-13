import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { runAudit } from "@/lib/auditEngine";
import { storeAudit } from "@/lib/storage";
import type { AuditFormState } from "@/types";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: AuditFormState & { _hp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill this, humans don't
  if (body._hp) {
    return NextResponse.json({ id: nanoid(10) });
  }

  const { _hp: _removed, ...form } = body;

  if (!form.tools || !Array.isArray(form.tools)) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const enabledTools = form.tools.filter((t) => t.enabled);
  if (enabledTools.length === 0) {
    return NextResponse.json({ error: "At least one tool must be enabled" }, { status: 400 });
  }

  const summary = runAudit(form);
  const id = nanoid(10);
  await storeAudit(id, form, summary);

  return NextResponse.json({ id }, { status: 200 });
}