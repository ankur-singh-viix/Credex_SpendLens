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

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "SpendLens — Free AI Tool Spend Audit",
  description:
    "Find out if you're overpaying for AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, Copilot spend — with exact savings you can capture today.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "SpendLens — Free AI Tool Spend Audit",
    description:
      "Enter what your team pays. Get an instant breakdown of where you're overspending — free, no login required.",
    type: "website",
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "SpendLens — Free AI Tool Spend Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Tool Spend Audit",
    description:
      "Find out if you're overpaying for AI tools in 2 minutes. Free audit.",
    images: [`${APP_URL}/api/og`],
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