"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Keeps the last two sentences of what the assistant said. */
export function lastSentences(text: string, count = 2): string {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?…]+[.!?…]+["»]?|[^.!?…]+$/g);
  if (!parts) return text.trim();
  return parts.slice(-count).join(" ").trim();
}

/** Large captions of everything Lina says, on the Menta (voice) surface. */
export function Captions({ text, speaker }: { text: string | null; speaker: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-[2.6em] w-full max-w-3xl items-start justify-center" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-balance rounded-xl bg-menta px-[1em] py-[0.6em] text-center text-[length:var(--s-caption)] font-semibold leading-snug text-ink"
          >
            <span className="sr-only">{speaker}: </span>
            {lastSentences(text)}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
