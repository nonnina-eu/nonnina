import type { Metadata } from "next";
import { Fragment } from "react";
import { Deck } from "@/components/pitch/deck";
import { slides } from "@/components/pitch/slides";

export const metadata: Metadata = {
  title: "Nonnina – Pitch",
  robots: { index: false, follow: false },
};

/** Hackathon pitch deck. English for every locale; not linked from the site. */
export default function PitchPage() {
  return <Deck slides={slides.map((s, i) => <Fragment key={i}>{s}</Fragment>)} />;
}
