"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmergencyEvent, EmergencyLevel, EmergencySource } from "@/lib/db/types";
import { deliveryMode, type EmergencyTriggerResult } from "@/lib/tool-outcomes";

export const WARNING_COUNTDOWN_SECONDS = 15;

export type EmergencyPhase =
  | "none"
  | "countdown" // warning only: relatives are notified after the countdown unless cancelled
  | "notifying" // request in flight
  | "notified" // API confirmed at least one relative was reached (or demo mode)
  | "failed" // API/network failed: show "please call 112", keep retrying in the background
  | "acknowledged"; // a relative pressed "I'm on it"

export interface EmergencyState {
  phase: EmergencyPhase;
  level: EmergencyLevel | null;
  reason: string;
  quote: string;
  source: EmergencySource | null;
  event: EmergencyEvent | null;
  secondsLeft: number;
  allClearSent: boolean;
}

export interface TriggerInput {
  level: EmergencyLevel;
  reason: string;
  quote?: string;
  source: EmergencySource;
}

const initial: EmergencyState = {
  phase: "none",
  level: null,
  reason: "",
  quote: "",
  source: null,
  event: null,
  secondsLeft: WARNING_COUNTDOWN_SECONDS,
  allClearSent: false,
};

const RETRY_MS = 5_000;
const POLL_MS = 3_000;

/** The other tap may still be writing the notification records. */
async function waitForNotification(eventId: string): Promise<EmergencyEvent | null> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const res = await fetch(`/api/emergency/${eventId}`, { cache: "no-store" });
      if (!res.ok) continue;
      const json = (await res.json()) as { event?: EmergencyEvent };
      if (json.event && deliveryMode(json.event.notified) !== "failed") return json.event;
    } catch {
      /* keep waiting */
    }
  }
  return null;
}

/**
 * Client-side emergency state machine. Independent from the voice session:
 * works with the manual button alone, keeps retrying when the network fails,
 * and never blocks on the AI.
 */
export function useEmergency(token: string) {
  const [state, setState] = useState<EmergencyState>(initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The request currently in flight, so a second trigger (keyword net + agent tool) reports the same outcome. */
  const inflight = useRef<Promise<EmergencyTriggerResult> | null>(null);

  const clearTimers = () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    countdownTimer.current = null;
    retryTimer.current = null;
  };

  const sendRef = useRef<(input: TriggerInput) => Promise<EmergencyTriggerResult>>(async () => ({ phase: "failed", notified: [] }));

  const send = useCallback(
    (input: TriggerInput): Promise<EmergencyTriggerResult> => {
      const run = async (): Promise<EmergencyTriggerResult> => {
        setState((s) => ({ ...s, phase: "notifying", level: input.level, reason: input.reason, quote: input.quote ?? "", source: input.source }));
        try {
          const res = await fetch("/api/emergency", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, ...input, quote: input.quote ?? "" }),
          });
          const json = (await res.json()) as { ok: boolean; event?: EmergencyEvent; mode?: "sent" | "demo" | "failed"; deduplicated?: boolean };
          if (!res.ok || !json.ok || !json.event) throw new Error("emergency request failed");
          let event = json.event;
          let mode = json.mode ?? deliveryMode(event.notified);
          if (json.deduplicated && mode === "failed") {
            const settled = await waitForNotification(event.id);
            if (settled) {
              event = settled;
              mode = deliveryMode(event.notified);
            }
          }
          const phase: EmergencyPhase = event.status === "acknowledged" ? "acknowledged" : mode === "failed" ? "failed" : "notified";
          setState((s) => ({ ...s, event, phase }));
          return { phase, notified: event.notified };
        } catch {
          setState((s) => ({ ...s, phase: "failed" }));
          retryTimer.current = setTimeout(() => {
            if (stateRef.current.phase === "failed" && !stateRef.current.event) void sendRef.current(input);
          }, RETRY_MS);
          return { phase: "failed", notified: [] };
        }
      };
      const p = run().finally(() => {
        if (inflight.current === p) inflight.current = null;
      });
      inflight.current = p;
      return p;
    },
    [token],
  );
  sendRef.current = send;

  const trigger = useCallback(
    async (input: TriggerInput): Promise<EmergencyTriggerResult> => {
      const current = stateRef.current;
      const active = current.phase !== "none";
      const snapshot = (): EmergencyTriggerResult => ({ phase: current.phase, notified: current.event?.notified ?? [] });

      if (input.level === "emergency") {
        // An emergency always wins: cancel a running warning countdown and notify immediately.
        if (active && current.level === "emergency" && current.phase !== "failed") return inflight.current ?? snapshot();
        clearTimers();
        return send(input);
      }

      // warning: something is already running (countdown, request in flight or a live event) – report that.
      if (active) return inflight.current ?? snapshot();
      clearTimers();
      setState({ ...initial, phase: "countdown", level: "warning", reason: input.reason, quote: input.quote ?? "", source: input.source });
      countdownTimer.current = setInterval(() => {
        const s = stateRef.current;
        if (s.phase !== "countdown") {
          clearTimers();
          return;
        }
        if (s.secondsLeft <= 1) {
          clearTimers();
          void send(input);
        } else {
          setState((prev) => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
        }
      }, 1000);
      return { phase: "countdown", notified: [] };
    },
    [send],
  );

  /** "I'm fine": cancels a countdown, or marks a notified event as cancelled and sends the all-clear. */
  const cancel = useCallback(async () => {
    clearTimers();
    const current = stateRef.current;
    if (!current.event) {
      setState(initial);
      return;
    }
    const eventId = current.event.id;
    setState({ ...initial, allClearSent: true });
    try {
      await fetch(`/api/emergency/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", token }),
      });
    } catch {
      /* best effort */
    }
    setTimeout(() => setState((s) => (s.phase === "none" ? { ...s, allClearSent: false } : s)), 6000);
  }, [token]);

  const dismiss = useCallback(() => {
    clearTimers();
    setState(initial);
  }, []);

  // Poll the event while it is live so the senior sees "Anna is on it".
  useEffect(() => {
    if (!state.event || state.phase !== "notified") return;
    const id = state.event.id;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/emergency/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { event?: EmergencyEvent };
        const fresh = json.event;
        if (!fresh) return;
        if (fresh.status === "acknowledged") {
          setState((s) => ({ ...s, event: fresh, phase: "acknowledged" }));
        } else if (fresh.updated_at !== stateRef.current.event?.updated_at) {
          // Keep escalation progress (who is being called) visible on the tablet.
          setState((s) => (s.phase === "notified" ? { ...s, event: fresh } : s));
        }
      } catch {
        /* ignore */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [state.event, state.phase]);

  useEffect(() => () => clearTimers(), []);

  return { state, trigger, cancel, dismiss };
}
