import { notFound } from "next/navigation";
import { getAudit } from "@/lib/storage";
import { AuditResults } from "@/components/AuditResults";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
      ? `This team could save $${savings}/mo ($${record.summary.totalAnnualSavings}/yr) on AI tools. See the full breakdown — free audit by SpendLens.`
      : "Free AI spend audit — this stack is already well-optimised. See how yours compares.";

  const ogImageUrl = `${APP_URL}/api/og?id=${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${APP_URL}/audit/${params.id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const record = await getAudit(params.id);
  if (!record) notFound();

  return <AuditResults record={record} />;
}