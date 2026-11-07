import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Nonnina – La compagna vocale per chi resta a casa",
    template: "%s · Nonnina",
  },
  description:
    "Nonnina è la compagna vocale per le persone anziane che vivono a casa. Un bottone per loro, un piano chiaro per la famiglia. nonnina.eu",
  openGraph: {
    title: "Nonnina",
    description:
      "La compagna vocale per chi resta a casa. Un bottone per la nonna, un piano chiaro per te. nonnina.eu",
    type: "website",
    locale: "it_IT",
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
    <html lang="it" className={`${manrope.variable} ${outfit.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
