"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanding } from "./language-provider";

export function Faq() {
  const { t } = useLanding();

  return (
    <section id="domande" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 className="max-w-[10ch] text-4xl text-[#202128] sm:text-5xl lg:text-[4rem]">{t.faq.title}</h2>
        <Accordion type="single" collapsible className="border-t border-[#e7ecec]">
          {t.faq.items.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`} className="rounded-none border-0 border-b border-[#e7ecec] bg-transparent shadow-none">
              <AccordionTrigger className="px-0 py-5 text-lg font-semibold hover:text-[#202128]">{item.q}</AccordionTrigger>
              <AccordionContent className="px-0 text-[#343a46]">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
