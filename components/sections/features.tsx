import { Bell, Clock, Doc, Mic, Phone, Users } from "../icons";
import { SectionHeading } from "./heading";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const look = [
  { icon: Mic, bg: "bg-menta" },
  { icon: Clock, bg: "bg-camomilla" },
  { icon: Phone, bg: "bg-allarme-soft", iconClass: "text-allarme" },
  { icon: Bell, bg: "bg-glicine" },
  { icon: Doc, bg: "bg-cielo" },
  { icon: Users, bg: "bg-salvia" },
];

export function Features({ t }: { t: Dictionary["features"] }) {
  return (
    <section className="wrap py-16 md:py-28" aria-labelledby="features-title">
      <SectionHeading id="features-title" eyebrow={t.eyebrow} title={t.title} lede={t.lede} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((item, i) => {
          const { icon: Icon, bg, iconClass } = look[i];
          return (
            <li key={item.title} className={cn("reveal grid min-h-[220px] content-between gap-10 rounded-lg p-6", bg, `reveal-d${(i % 3) + 1}`)}>
              <span className="grid size-12 place-items-center rounded-sm bg-white"><Icon className={cn("size-6", iconClass)} /></span>
              <div>
                <h3 className="text-[1.75rem] leading-none">{item.title}</h3>
                <p className="mt-2 text-base text-graphite">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
