import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { getStore } from "@/lib/db";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Nonnina",
    template: "%s · Nonnina",
  },
  description:
    "Nonnina is a voice companion for older people living at home. One button for your parent, instant alerts for the family.",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
};

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--font-display",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

/** The senior screen speaks German or Italian: tell the browser and screen readers which one. */
async function documentLang(): Promise<string> {
  const path = (await headers()).get("x-nonnina-path") ?? "";
  const token = /^\/senior\/([^/]+)/.exec(path)?.[1];
  if (!token || token === "open") return "en";
  try {
    const ctx = await getStore().getSeniorByToken(decodeURIComponent(token));
    return ctx?.senior.language ?? "en";
  } catch {
    return "en";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={await documentLang()} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
