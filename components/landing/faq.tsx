"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, SectionHeading } from "./section";
import { useLanding } from "./language-provider";

export function Faq() {
  const { t } = useLanding();
  return (
    <Section id="faq">
      <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />
      <Accordion type="single" collapsible className="mx-auto max-w-3xl space-y-3">
        {t.faq.items.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
