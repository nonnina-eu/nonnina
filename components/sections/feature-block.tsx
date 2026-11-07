import Image from "next/image";
import { Spark } from "../brand";
import { ArrowRight, CheckBadge } from "../icons";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  eyebrow: string;
  title: string;
  lede?: string;
  points: string[];
  image: { src: string; alt: string; position?: string };
  /** Small UI card layered over the photo (Grassfeld’s bg/fg pattern). */
  card: React.ReactNode;
  cta: { href: string; label: string };
  reverse?: boolean;
  tone?: string;
}

export function FeatureBlock({ id, eyebrow, title, lede, points, image, card, cta, reverse = false, tone = "bg-latte" }: Props) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className="wrap py-6 md:py-8" aria-labelledby={headingId}>
      <div className={cn("grid items-center gap-8 rounded-xl p-5 sm:p-8 md:grid-cols-2 md:gap-12 md:p-12", tone)}>
        <div className={cn("reveal", reverse && "md:order-2")}>
          <span className="eyebrow"><Spark className="size-3.5" />{eyebrow}</span>
          <h2 id={headingId} className="mt-4 text-balance text-[2.25rem] leading-[0.95] sm:text-5xl">{title}</h2>
          {lede ? <p className="lede mt-4">{lede}</p> : null}
          <ul className="my-6 grid gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3"><CheckBadge className="mt-0.5 size-5 shrink-0" /><span>{p}</span></li>
            ))}
          </ul>
          <a href={cta.href} className="btn btn-ink">{cta.label}<ArrowRight className="size-[18px]" /></a>
        </div>
        <div className={cn("reveal reveal-d1 relative aspect-[4/4.3] overflow-hidden rounded-lg", reverse && "md:order-1")}>
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" style={{ objectPosition: image.position ?? "50% 50%" }} />
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">{card}</div>
        </div>
      </div>
    </section>
  );
}
