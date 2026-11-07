"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Phone, PhoneCall } from "lucide-react";
import type { EmergencyState } from "@/hooks/use-emergency";
import type { SeniorStrings } from "@/lib/i18n/senior";
import { cn } from "@/lib/utils";

interface Props {
  t: SeniorStrings;
  state: EmergencyState;
  relativeNames: string[];
  primaryRelative: { name: string; phone: string | null } | null;
  onCancel: () => void;
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
    "flex min-h-[clamp(64px,14vmin,112px)] w-full items-center justify-center gap-[0.5em] rounded-full px-[1em] text-center text-[length:clamp(20px,4.2vmin,32px)] font-bold leading-tight focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-white/40 [&_svg]:size-[1.25em] [&_svg]:shrink-0",
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

/** Full-screen emergency mode: calm dark red, very large text, 112 one tap away. */
export function EmergencyOverlay({ t, state, relativeNames, primaryRelative, onCancel }: Props) {
  const reduce = useReducedMotion();
  const open = state.level === "emergency" && state.phase !== "none" && state.phase !== "countdown";
  const names = t.joinNames(relativeNames);

  let statusLine: React.ReactNode;
  if (state.phase === "acknowledged") {
    statusLine = (
      <span className="inline-flex items-center gap-3 text-emerald-200">
        <Check className="size-[1.2em]" />
        {t.acknowledged(primaryRelative?.name ?? relativeNames[0] ?? "")}
      </span>
    );
  } else if (state.phase === "notified") {
    statusLine = t.emergencyNotified(names);
  } else if (state.phase === "failed") {
    statusLine = <span className="text-amber-200">{t.emergencyFailed}</span>;
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
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#7F1D1D] p-[clamp(16px,4vmin,48px)] text-white"
        >
          <div>
            <h2 id="emergency-title" className="text-[length:clamp(34px,9vmin,72px)] font-bold leading-tight tracking-tight">
              {t.emergencyTitle}
            </h2>
            <p className="mt-[0.5em] text-[length:clamp(20px,4.6vmin,36px)] leading-snug text-red-50" aria-live="assertive">
              {statusLine}
            </p>
            <p className="mt-[0.5em] text-[length:clamp(17px,3.6vmin,28px)] leading-snug text-red-100/90">{t.emergencyCalm}</p>
          </div>

          <div className="grid gap-[clamp(10px,2vmin,20px)]">
            <BigButton href="tel:112" className="bg-white text-red-700 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <Phone />
              {t.call112}
              <span className="ml-[0.3em] rounded-full bg-red-700 px-[0.6em] py-[0.1em] text-[1.15em] text-white">112</span>
            </BigButton>
            <p className="text-center text-[length:clamp(14px,2.9vmin,22px)] text-red-100/80">{t.noPhone}</p>
            <div className="grid gap-[clamp(10px,2vmin,20px)] md:grid-cols-2">
              {primaryRelative?.phone ? (
                <BigButton href={`tel:${primaryRelative.phone}`} className="border-4 border-white/70 bg-transparent text-white">
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

/** Calm banner for the "warning" level: countdown that the senior can cancel. */
export function WarningBanner({ t, state, relativeNames, onCancel, onDismiss }: { t: SeniorStrings; state: EmergencyState; relativeNames: string[]; onCancel: () => void; onDismiss: () => void }) {
  const reduce = useReducedMotion();
  const open = state.level === "warning" && state.phase !== "none";
  const names = t.joinNames(relativeNames);

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
          className="fixed inset-x-[var(--s-pad)] top-[var(--s-pad)] z-40 rounded-[2rem] border-2 border-amber-300 bg-amber-50 p-[1em] text-amber-950 shadow-soft"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[1.25em] font-semibold leading-tight">{t.warningTitle}</p>
              <p className="mt-1 leading-snug">
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
              <button
                type="button"
                onClick={onCancel}
                className="flex min-h-[var(--s-help)] items-center justify-center rounded-full bg-white px-[1.2em] text-[1.05em] font-semibold text-amber-900 shadow-soft ring-2 ring-amber-300 focus-visible:outline-none focus-visible:ring-4"
              >
                {t.cancelWarning}
              </button>
            ) : (
              <button
                type="button"
                onClick={onDismiss}
                className="flex min-h-[var(--s-help)] items-center justify-center rounded-full bg-white px-[1.2em] text-[1.05em] font-semibold text-amber-900 shadow-soft ring-2 ring-amber-300 focus-visible:outline-none focus-visible:ring-4"
              >
                {t.close}
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
