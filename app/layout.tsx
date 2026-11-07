import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
