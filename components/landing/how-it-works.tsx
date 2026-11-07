"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Check, HandHelping, LayoutDashboard, MessageCircle, Mic, Sparkles, Users, X } from "lucide-react";
import { Section, SectionHeading } from "./section";
import { useLanding } from "./language-provider";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function Node({
  index,
  icon,
  title,
  body,
  className,
  tone = "blue",
}: {
  index?: number;
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-secondary text-primary",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className={cn("card-soft relative flex h-full flex-col p-6", className)}>
      {index !== undefined ? (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">{index}</span>
      ) : null}
      <span className={cn("flex size-11 items-center justify-center rounded-full", tones[tone])}>{icon}</span>
      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center text-primary/60", vertical ? "py-1" : "px-1")} aria-hidden>
      {vertical ? <ArrowDown className="size-5" /> : <ArrowRight className="size-5" />}
    </div>
  );
}

export function HowItWorks() {
  const { t } = useLanding();
  const reduce = useReducedMotion();
  const stepIcons = [<Mic key="m" className="size-5" />, <MessageCircle key="c" className="size-5" />, <Sparkles key="s" className="size-5" />];

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: i * 0.1, ease },
  });

  return (
    <Section id="how-it-works" className="bg-gradient-to-b from-background via-secondary/40 to-background">
      <SectionHeading eyebrow={t.how.eyebrow} title={t.how.title} />

      {/* Desktop: horizontal flow with a branch */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
          {t.how.steps.map((s, i) => (
            <motion.div key={s.title} {...item(i)} className="contents">
              <Node index={i + 1} icon={stepIcons[i]} title={s.title} body={s.body} />
              {i < 2 ? <Connector /> : null}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2">
          <div className="col-start-5 flex justify-center" aria-hidden>
            <ArrowDown className="size-5 text-primary/60" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div {...item(3)}>
            <Node
              tone="green"
              icon={<Check className="size-5" />}
              title={`${t.how.yes.label} · ${t.how.yes.title}`}
              body={t.how.yes.body}
              className="border-emerald-200"
            />
          </motion.div>
          <motion.div {...item(4)}>
            <Node
              tone="amber"
              icon={<X className="size-5" />}
              title={`${t.how.no.label} · ${t.how.no.title}`}
              body={t.how.no.body}
              className="border-amber-200"
            />
          </motion.div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div />
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <motion.div {...item(5)}>
              <Node tone="blue" icon={<LayoutDashboard className="size-5" />} title={t.how.after[0].title} body={t.how.after[0].body} />
            </motion.div>
            <Connector />
            <motion.div {...item(6)}>
              <Node tone="slate" icon={<Users className="size-5" />} title={t.how.after[1].title} body={t.how.after[1].body} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: vertical stepper */}
      <ol className="relative space-y-3 border-l-2 border-primary/15 pl-6 lg:hidden">
        {t.how.steps.map((s, i) => (
          <motion.li key={s.title} {...item(i)} className="relative">
            <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-primary ring-4 ring-background" aria-hidden />
            <Node index={i + 1} icon={stepIcons[i]} title={s.title} body={s.body} />
          </motion.li>
        ))}
        <motion.li {...item(3)} className="relative">
          <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-emerald-500 ring-4 ring-background" aria-hidden />
          <Node tone="green" icon={<Check className="size-5" />} title={`${t.how.yes.label} · ${t.how.yes.title}`} body={t.how.yes.body} className="border-emerald-200" />
        </motion.li>
        <motion.li {...item(4)} className="relative">
          <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-amber-500 ring-4 ring-background" aria-hidden />
          <Node tone="amber" icon={<X className="size-5" />} title={`${t.how.no.label} · ${t.how.no.title}`} body={t.how.no.body} className="border-amber-200" />
        </motion.li>
        {t.how.after.map((s, i) => (
          <motion.li key={s.title} {...item(5 + i)} className="relative">
            <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-primary ring-4 ring-background" aria-hidden />
            <Node icon={i === 0 ? <LayoutDashboard className="size-5" /> : <HandHelping className="size-5" />} title={s.title} body={s.body} tone={i === 0 ? "blue" : "slate"} />
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}
