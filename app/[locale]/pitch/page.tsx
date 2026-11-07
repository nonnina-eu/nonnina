import type { Metadata } from "next";
import { Fragment } from "react";
import { Deck } from "@/components/pitch/deck";
import { slides } from "@/components/pitch/slides";
import { isLocale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Nonnina – Pitch",
    robots: { index: false, follow: false },
    // Own canonical + hreflang, otherwise the page would inherit the home page's from the layout.
    ...(isLocale(locale) ? { alternates: pageAlternates(locale, "/pitch") } : {}),
  };
}

/** Hackathon pitch deck. English for every locale; not linked from the site. */
export default function PitchPage() {
  return <Deck slides={slides.map((s, i) => <Fragment key={i}>{s}</Fragment>)} />;
}
