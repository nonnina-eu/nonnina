"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BellRing, Clock, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabletMockup } from "./tablet-mockup";
import { useLanding } from "./language-provider";

function FloatingCard({
  icon,
  title,
  sub,
  tone = "blue",
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone?: "blue" | "green" | "red";
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const tones = {
    blue: "bg-secondary text-primary",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-600",
  };
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`card-soft flex items-center gap-3 p-4 ${className ?? ""}`}
    >
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const { t } = useLanding();
  const reduce = useReducedMotion();

  return (
    <section className="sky-glow relative overflow-hidden pb-12 pt-10 md:pb-20 md:pt-20">
      <div className="container">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              <Sparkles className="size-3" />
              New
            </span>
            {t.hero.badge.replace(/^New · |^Neu · /, "")}
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            <span className="text-primary">{t.hero.title1}</span>
            <br />
            <span className="font-normal text-slate-700">{t.hero.title2}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">{t.hero.subtitle}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#waitlist">
                {t.hero.primary}
                <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">
                {t.hero.secondary}
                <ArrowRight />
              </a>
            </Button>
          </div>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-5xl md:mt-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <TabletMockup />
          </motion.div>

          <FloatingCard
            icon={<BellRing className="size-5" />}
            title={t.hero.cardAlert}
            sub={t.hero.cardAlertSub}
            tone="green"
            delay={0.5}
            className="absolute left-0 top-[18%] hidden w-64 -translate-x-1/3 lg:flex"
          />
          <FloatingCard
            icon={<Clock className="size-5" />}
            title={t.hero.cardReminder}
            sub={t.hero.cardReminderSub}
            delay={0.65}
            className="absolute bottom-[18%] left-0 hidden w-60 -translate-x-1/4 lg:flex"
          />
          <FloatingCard
            icon={<Phone className="size-5" />}
            title={t.hero.cardEmergency}
            sub={t.hero.cardEmergencySub}
            tone="red"
            delay={0.8}
            className="absolute right-0 top-[40%] hidden w-60 translate-x-1/3 lg:flex"
          />

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:hidden">
            <FloatingCard icon={<BellRing className="size-5" />} title={t.hero.cardAlert} sub={t.hero.cardAlertSub} tone="green" />
            <FloatingCard icon={<Clock className="size-5" />} title={t.hero.cardReminder} sub={t.hero.cardReminderSub} />
            <FloatingCard icon={<Phone className="size-5" />} title={t.hero.cardEmergency} sub={t.hero.cardEmergencySub} tone="red" />
          </div>
        </div>
      </div>
    </section>
  );
}
