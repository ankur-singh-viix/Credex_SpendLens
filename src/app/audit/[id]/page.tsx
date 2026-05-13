import { notFound } from "next/navigation";
import { getAudit } from "@/lib/storage";
import { AuditResults } from "../../../components/AuditResults";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await getAudit(params.id);
  if (!record) return { title: "Audit not found — SpendLens" };

  const savings = record.summary.totalMonthlySavings;
  const title =
    savings > 0
      ? `I found $${savings}/mo in AI tool savings — SpendLens`
      : "My AI tool stack is already optimised — SpendLens";

  const description =
    savings > 0
      ? `This team could save $${savings}/mo ($${record.summary.totalAnnualSavings}/yr) by optimising their AI tool stack. See the full breakdown.`
      : "Free AI spend audit — see if your team is overpaying for Cursor, Copilot, Claude, ChatGPT and more.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ["/og-default.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const record = await getAudit(params.id);
  if (!record) notFound();

  return <AuditResults record={record} />;
}