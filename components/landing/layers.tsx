"use client";

import { HandHelping, Heart, Users } from "lucide-react";
import { Reveal, Section, SectionHeading } from "./section";
import { useLanding } from "./language-provider";

const icons = [Heart, Users, HandHelping];

export function Layers() {
  const { t } = useLanding();
  return (
    <Section id="layers" className="bg-gradient-to-b from-background via-secondary/40 to-background">
      <SectionHeading eyebrow={t.layers.eyebrow} title={t.layers.title} />
      <div className="grid gap-5 md:grid-cols-3">
        {t.layers.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="card-soft h-full p-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[hsl(214_100%_70%)] to-primary text-white shadow-glow">
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
