"use client";

import { Eye, FileText, Lock, MicOff, UserCheck } from "lucide-react";
import { Reveal, Section, SectionHeading } from "./section";
import { useLanding } from "./language-provider";

const icons = [Lock, UserCheck, MicOff, Eye, FileText];

export function Trust() {
  const { t } = useLanding();
  return (
    <Section id="trust">
      <SectionHeading eyebrow={t.trust.eyebrow} title={t.trust.title} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {t.trust.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="card-soft h-full p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
