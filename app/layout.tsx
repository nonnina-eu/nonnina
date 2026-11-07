import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Nonnina – One tap at home. A clear text for you.",
    template: "%s · Nonnina",
  },
  description:
    "Nonnina is a voice companion for older people living at home. They tap once and talk. The family hears about it in seconds. nonnina.eu",
  openGraph: {
    title: "Nonnina",
    description: "One tap at home. A clear text for the family. nonnina.eu",
    type: "website",
    locale: "en_GB",
    siteName: "Nonnina",
  },
};

export const viewport: Viewport = {
  themeColor: "#202128",
  width: "device-width",
  initialScale: 1,
};

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

const outfit = Outfit({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${outfit.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
