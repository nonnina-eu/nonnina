"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { Spark } from "@/components/logo";
import { cn } from "@/lib/utils";

export type TalkState = "idle" | "connecting" | "listening" | "speaking" | "ended";

interface TalkButtonProps {
  state: TalkState;
  label: string;
  onPress: () => void;
  /** Called ~12×/s to read the current mic / speaker volume (0..1). */
  getVolume?: () => number;
  disabled?: boolean;
}

/**
 * The one big round button: Ink, with one Sole glow. ≥ 260 px, one clear visual per state.
 * The ring reacts to the microphone (listening) or the speaker (speaking) volume, and the
 * spark lights up while Nonnina listens or talks.
 */
export function TalkButton({ state, label, onPress, getVolume, disabled }: TalkButtonProps) {
  const reduce = useReducedMotion();
  const [volume, setVolume] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!getVolume || (state !== "listening" && state !== "speaking") || reduce) {
      setVolume(0);
      return;
    }
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 80) {
        last = t;
        const v = Math.min(1, Math.max(0, getVolume()));
        setVolume((prev) => prev * 0.6 + v * 0.4);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [getVolume, state, reduce]);

  const active = state === "listening" || state === "speaking";
  const ringScale = 1 + volume * (state === "speaking" ? 0.35 : 0.5);

  return (
    <div className="relative flex items-center justify-center">
      {/* breathing Sole glow (idle) */}
      {state === "idle" && !reduce ? (
        <span aria-hidden className="absolute size-[115%] rounded-full bg-sole/30 blur-2xl animate-breathe" />
      ) : null}

      {/* volume ring: Sole while listening, Menta while Lina speaks */}
      {active ? (
        <motion.span
          aria-hidden
          className={cn("absolute inset-[-10%] rounded-full border-[6px]", state === "speaking" ? "border-menta" : "border-sole/80")}
          animate={{ scale: reduce ? 1 : ringScale, opacity: 0.55 + volume * 0.45 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        />
      ) : null}

      {/* connecting spinner ring */}
      {state === "connecting" && !reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-[-8%] rounded-full border-[6px] border-ink/10 border-t-sole"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
        />
      ) : null}

      <motion.button
        type="button"
        onClick={onPress}
        disabled={disabled}
        aria-live="polite"
        aria-label={label}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className={cn(
          "btn-glossy relative flex aspect-square w-[var(--s-btn)] flex-col items-center justify-center gap-3 rounded-full text-white focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-sole/40 disabled:opacity-60",
        )}
      >
        {/* the voice spark lights up when Nonnina listens */}
        {active ? (
          <Spark className={cn("absolute right-[12%] top-[12%] size-[14%]", !reduce && "animate-twinkle")} />
        ) : null}
        {state === "connecting" ? (
          <Loader2 className="size-[26%] animate-spin" strokeWidth={2} />
        ) : state === "speaking" ? (
          <Volume2 className="size-[26%]" strokeWidth={2} />
        ) : state === "listening" ? (
          <Square className="size-[18%] fill-current" strokeWidth={2} />
        ) : (
          <Mic className="size-[26%]" strokeWidth={2} />
        )}
        <span className="px-[1em] text-center text-[length:var(--s-btn-label)] font-bold leading-tight">{label}</span>
      </motion.button>
    </div>
  );
}
