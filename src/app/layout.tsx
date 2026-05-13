import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SpendLens — Free AI Tool Spend Audit",
  description:
    "Find out if you're overspending on AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, Copilot and more — with exact savings you can capture today.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "SpendLens — Free AI Tool Spend Audit",
    description:
      "Find out if you're overspending on AI tools. Takes 2 minutes.",
    type: "website",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Tool Spend Audit",
    description: "Find out if you're overspending on AI tools in 2 minutes.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable}`}>
      <body className="bg-surface-0 text-white antialiased">{children}</body>
    </html>
  );
}
