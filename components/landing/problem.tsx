"use client";

import { FileWarning, Home, Scale } from "lucide-react";
import { Reveal, Section, SectionHeading } from "./section";
import { useLanding } from "./language-provider";

const icons = [Home, FileWarning, Scale];

export function Problem() {
  const { t } = useLanding();
  return (
    <Section id="problem">
      <SectionHeading eyebrow={t.problem.eyebrow} title={t.problem.title} />
      <div className="grid gap-5 md:grid-cols-3">
        {t.problem.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="card-soft h-full p-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
