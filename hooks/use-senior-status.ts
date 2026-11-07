"use client";

import { useEffect, useState } from "react";

export interface SeniorStatus {
  helpRequest: { id: string; summary: string; acknowledgedBy: string | null; acknowledgedAt: string | null } | null;
  emergency: { id: string; level: "emergency" | "warning"; status: string; acknowledgedBy: string | null } | null;
}

const POLL_MS = 4_000;

/**
 * Polls GET /api/senior/:token/status so the tablet shows "Anna kümmert sich um: …".
 * Purely informational: failures keep the last good value and never touch the emergency path.
 */
export function useSeniorStatus(token: string): SeniorStatus | null {
  const [status, setStatus] = useState<SeniorStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/senior/${encodeURIComponent(token)}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as SeniorStatus & { ok: boolean };
        if (alive && json.ok) setStatus({ helpRequest: json.helpRequest, emergency: json.emergency });
      } catch {
        /* offline: keep the last value */
      }
    };
    void load();
    const timer = setInterval(() => void load(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [token]);

  return status;
}
