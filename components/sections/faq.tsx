import { Plus } from "../icons";
import { SectionHeading } from "./heading";
import type { Dictionary } from "@/lib/i18n";

/** Native <details>: accessible and works without JavaScript. */
export function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <section id="faq" className="wrap py-16 md:py-24" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading id="faq-title" eyebrow={t.eyebrow} title={t.title} />
        <div className="grid gap-3">
          {t.items.map((item) => (
            <details key={item.q} className="faq reveal group rounded-lg bg-mist open:bg-latte">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-lg font-bold">
                {item.q}
                <span className="faq-icon grid size-8 shrink-0 place-items-center rounded-full bg-white transition-transform"><Plus className="size-4" /></span>
              </summary>
              <p className="px-6 pb-6 text-graphite">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
