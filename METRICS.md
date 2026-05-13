# METRICS.md

## North Star Metric

**Qualified leads generated per week** — defined as email captures from audits showing ≥$100/mo in savings.

*Why:* SpendLens is a lead-generation asset for Credex. DAU is meaningless for a tool people use once per quarter. The North Star must map to Credex revenue, and a qualified lead (someone with real savings to capture) is the unit that converts.

## 3 Input Metrics

1. **Audit completion rate** (audits completed / audits started)
   - Target: ≥70%
   - Lever: Reduce friction in the form; auto-populate plan from common selections

2. **Email capture rate** (emails captured / audits completed)
   - Target: ≥30%
   - Lever: Show compelling savings number before the email gate; "Notify me when savings improve" for low-savings audits

3. **Shareable URL click-through rate** (unique opens of shared audit URLs / audits shared)
   - Target: ≥25%
   - Lever: Open Graph preview quality; headline copy on the share card

## What to Instrument First

1. Funnel events: `audit_started`, `audit_completed`, `email_captured`, `consultation_booked`
2. Tool toggle counts (which tools are most commonly audited — informs which catalog entries need most polish)
3. Savings distribution histogram (are we showing real savings or lots of "already optimal"?)
4. Referral source (UTM) for every audit start

## Pivot Trigger

If after 500 audit completions:
- Email capture rate < 15% → the value prop isn't landing; rethink results page hierarchy
- Consultation booking rate < 5% (among high-savings audits) → Credex CTA isn't compelling; test copy/placement
- Average savings shown < $100/mo → audit engine too conservative or wrong user segment; revisit rules
