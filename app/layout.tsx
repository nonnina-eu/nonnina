import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Care Copilot – One button for your parent. One clear plan for you.",
    template: "%s · Care Copilot",
  },
  description:
    "Care Copilot is a voice companion for older people living at home. It helps every day, and alerts the family the moment something is wrong.",
  openGraph: {
    title: "Care Copilot",
    description:
      "A voice companion for older people living at home. One button for your parent, one clear plan for you.",
    type: "website",
    locale: "en_GB",
    siteName: "Care Copilot",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F7CF6",
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
