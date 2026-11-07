"use client";

import { useEffect } from "react";

/** Keeps the tablet screen on while the senior screen is open (Screen Wake Lock API). */
export function useWakeLock(): void {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function request() {
      try {
        if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        /* not supported or denied – nothing to do */
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, []);
}
