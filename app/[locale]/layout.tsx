import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { env } from "@/lib/env";
import { getDictionary, isLocale, locales, ogLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, languageAlternates } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--font-display",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(env.siteUrl()),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: absoluteUrl(locale), languages: languageAlternates() },
    openGraph: {
      type: "website",
      siteName: "Nonnina",
      title: t.meta.title,
      description: t.meta.description,
      url: absoluteUrl(locale),
      locale: ogLocale[locale],
      images: [{ url: "/photos/hands.jpg", width: 2400, height: 1607, alt: t.hero.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/photos/hands.jpg"] },
  };
}

export const viewport: Viewport = { themeColor: "#FAF6F0", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale as Locale} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        {/* Marks JS as available so reveal animations only hide content when they can show it again. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
