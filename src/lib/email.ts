import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM_EMAIL = "SpendLens <hello@spendlens.app>";

interface SendAuditEmailParams {
  to: string;
  auditId: string;
  monthlySavings: number;
  annualSavings: number;
  hasHighSavings: boolean;
  toolCount: number;
}

export async function sendAuditConfirmationEmail(
  params: SendAuditEmailParams
): Promise<void> {
  const {
    to,
    auditId,
    monthlySavings,
    annualSavings,
    hasHighSavings,
    toolCount,
  } = params;

  const auditUrl = `${APP_URL}/audit/${auditId}`;

  const subject =
    monthlySavings > 0
      ? `Your AI spend audit: $${monthlySavings}/mo in savings found`
      : "Your AI spend audit: your stack looks well-optimised";

  const credexBlock = hasHighSavings
    ? `
    <div style="background:#0a2e28;border:1px solid #0db896;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="color:#0db896;font-weight:600;margin:0 0 8px;">Save even more with Credex</p>
      <p style="color:#8aada6;font-size:14px;margin:0 0 16px;">
        Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise and more.
        Teams at your savings level typically unlock an additional 20–30% off with credits.
      </p>
      <a href="https://credex.rocks" style="background:#0db896;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
        Book a free Credex consultation →
      </a>
    </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0e0d;color:#e8f0ee;font-family:system-ui,sans-serif;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="margin-bottom:32px;">
      <span style="color:#0db896;font-size:24px;">◈</span>
      <span style="font-weight:700;font-size:18px;margin-left:8px;">SpendLens</span>
    </div>

    <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
      ${monthlySavings > 0
        ? `We found <span style="color:#0db896;">$${monthlySavings}/mo</span> in savings`
        : "Your AI stack is well-optimised"}
    </h1>

    <p style="color:#8aada6;font-size:15px;margin:0 0 24px;">
      ${monthlySavings > 0
        ? `That's <strong style="color:white;">$${annualSavings}/year</strong> across your ${toolCount} audited tool${toolCount !== 1 ? "s" : ""}.`
        : `We audited ${toolCount} tool${toolCount !== 1 ? "s" : ""} and found no significant savings — you're spending well.`}
    </p>

    <a href="${auditUrl}"
       style="display:inline-block;background:#0db896;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
      View your full audit →
    </a>

    ${credexBlock}

    <div style="border-top:1px solid #1a2420;padding-top:24px;margin-top:8px;">
      <p style="color:#4a6b62;font-size:13px;margin:0 0 4px;">
        Share your results: <a href="${auditUrl}" style="color:#0db896;">${auditUrl}</a>
      </p>
      <p style="color:#4a6b62;font-size:12px;margin:0;">
        You're receiving this because you ran an audit on SpendLens.
        This is a one-time email — we won't spam you.
      </p>
    </div>

  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}