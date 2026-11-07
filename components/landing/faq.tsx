"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    q: "Does my parent need a smartphone?",
    a: "No. A tablet with one button is enough. During the pilot we can send one that is already set up.",
  },
  {
    q: "What happens in an emergency?",
    a: "The screen switches to help mode, with a large Call 112 button, and relatives get a text within seconds. Nonnina never calls 112 by itself.",
  },
  {
    q: "Who can see what was said?",
    a: "Only relatives your parent has invited. The voice is not recorded. We keep a short written summary, stored in the EU.",
  },
  {
    q: "What does it cost?",
    a: "Free during the pilot. Pricing goes to the waitlist first. The official name is Nonnina. The domain is nonnina.eu.",
  },
];

export function Faq() {
  return (
    <section id="questions" className="scroll-mt-20 px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-4xl text-[#202128] sm:text-5xl">Questions</h2>
        <Accordion type="single" collapsible className="mt-6 border-t border-[#e7ecec]">
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`q-${index}`} className="rounded-none border-0 border-b border-[#e7ecec] bg-transparent shadow-none">
              <AccordionTrigger className="px-0 py-5 text-left text-lg font-semibold hover:text-[#202128]">{item.q}</AccordionTrigger>
              <AccordionContent className="px-0 text-base leading-relaxed text-[#343a46]">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
