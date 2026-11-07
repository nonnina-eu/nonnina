"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Phone, PhoneCall } from "lucide-react";
import type { EmergencyState } from "@/hooks/use-emergency";
import type { EmergencyEvent } from "@/lib/db/types";
import type { SeniorStrings } from "@/lib/i18n/senior";
import { cn } from "@/lib/utils";

interface Props {
  t: SeniorStrings;
  state: EmergencyState;
  relativeNames: string[];
  primaryRelative: { name: string; phone: string | null } | null;
  onCancel: () => void;
}

/**
 * The event as the screen polls it. The escalation fields are optional here so the screen
 * compiles before and after the data layer adds them to `EmergencyEvent`.
 */
type LiveEvent = EmergencyEvent & {
  escalation_step?: number;
  next_step_at?: string | null;
  acknowledged_by?: string | null;
};

function escalationStep(event: EmergencyEvent | null): number {
  const live = event as LiveEvent | null;
  return typeof live?.escalation_step === "number" ? live.escalation_step : 0;
}

function BigButton({
  href,
  onClick,
  className,
  children,
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "flex min-h-[clamp(64px,14vmin,112px)] w-full items-center justify-center gap-[0.5em] rounded-xl px-[1em] text-center text-[length:clamp(20px,4.2vmin,32px)] font-bold leading-tight focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-white/40 [&_svg]:size-[1.25em] [&_svg]:shrink-0",
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

/** Full-screen emergency mode: calm dark Allarme, very large text, 112 one tap away. */
export function EmergencyOverlay({ t, state, relativeNames, primaryRelative, onCancel }: Props) {
  const reduce = useReducedMotion();
  const open = state.level === "emergency" && state.phase !== "none" && state.phase !== "countdown";
  const names = t.joinNames(relativeNames);
  const step = escalationStep(state.event);

  // At most one calm line. Never a timer.
  let statusLine: React.ReactNode;
  if (state.phase === "acknowledged") {
    statusLine = (
      <span className="inline-flex items-center gap-3 text-salvia">
        <Check className="size-[1.2em]" />
        {t.acknowledged(primaryRelative?.name ?? relativeNames[0] ?? "")}
      </span>
    );
  } else if (state.phase === "notified") {
    const live = state.event as LiveEvent | null;
    const exhausted = step > 0 && live?.next_step_at === null;
    statusLine = exhausted ? (
      <span className="text-camomilla">{t.nobodyConfirmed}</span>
    ) : step > 0 ? (
      t.escalating
    ) : (
      t.emergencyNotified(names)
    );
  } else if (state.phase === "failed") {
    statusLine = <span className="text-camomilla">{t.emergencyFailed}</span>;
  } else {
    statusLine = (
      <span className="inline-flex items-center gap-3">
        <Loader2 className="size-[1.2em] animate-spin" />
        {t.emergencyNotifying}
      </span>
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-allarme-deep p-[clamp(16px,4vmin,48px)] text-white"
        >
          <div>
            <h2 id="emergency-title" className="font-display text-[length:clamp(34px,9vmin,72px)] leading-tight text-white">
              {t.emergencyTitle}
            </h2>
            <p className="mt-[0.5em] text-[length:clamp(20px,4.6vmin,36px)] font-semibold leading-snug text-white" aria-live="assertive">
              {statusLine}
            </p>
            <p className="mt-[0.5em] text-[length:clamp(17px,3.6vmin,28px)] leading-snug text-white/90">{t.emergencyCalm}</p>
          </div>

          <div className="grid gap-[clamp(10px,2vmin,20px)]">
            <BigButton href="tel:112" className="bg-white text-allarme shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <Phone />
              {t.call112}
              <span className="ml-[0.3em] rounded-full bg-allarme px-[0.6em] py-[0.1em] text-[1.15em] text-white">112</span>
            </BigButton>
            <p className="text-center text-[length:clamp(14px,2.9vmin,22px)] text-white/85">{t.noPhone}</p>
            <div className="grid gap-[clamp(10px,2vmin,20px)] md:grid-cols-2">
              {primaryRelative?.phone ? (
                <BigButton href={`tel:${primaryRelative.phone}`} className="border-4 border-white/80 bg-transparent text-white">
                  <PhoneCall />
                  {t.callRelative(primaryRelative.name)}
                </BigButton>
              ) : (
                <div />
              )}
              <BigButton onClick={onCancel} className="bg-white/15 text-white hover:bg-white/25">
                <Check />
                {t.imFine}
              </BigButton>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Calm banner for the "warning" level: Camomilla surface, a countdown the senior can cancel. */
export function WarningBanner({ t, state, relativeNames, onCancel, onDismiss }: { t: SeniorStrings; state: EmergencyState; relativeNames: string[]; onCancel: () => void; onDismiss: () => void }) {
  const reduce = useReducedMotion();
  const open = state.level === "warning" && state.phase !== "none";
  const names = t.joinNames(relativeNames);
  const buttonClasses =
    "flex min-h-[var(--s-help)] items-center justify-center rounded-xl bg-white px-[1.2em] text-[1.05em] font-bold text-ink shadow-soft ring-2 ring-sole focus-visible:outline-none focus-visible:ring-4";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-[var(--s-pad)] top-[var(--s-pad)] z-40 rounded-2xl border-2 border-sole bg-camomilla p-[1em] text-ink shadow-float"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-[1.35em] leading-tight text-ink">{t.warningTitle}</p>
              <p className="mt-1 leading-snug text-ink">
                {state.phase === "countdown"
                  ? t.warningBody(names, state.secondsLeft)
                  : state.phase === "acknowledged"
                    ? t.acknowledged(relativeNames[0] ?? "")
                    : state.phase === "failed"
                      ? t.emergencyFailed
                      : t.warningSent(names)}
              </p>
            </div>
            {state.phase === "countdown" ? (
              <button type="button" onClick={onCancel} className={buttonClasses}>
                {t.cancelWarning}
              </button>
            ) : (
              <button type="button" onClick={onDismiss} className={buttonClasses}>
                {t.close}
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
