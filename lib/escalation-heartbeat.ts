import { runEscalationTick } from "./escalation-runner";

/**
 * Escalation without a per-minute cron (Vercel Hobby allows only daily crons).
 * The senior tablet polls /api/senior/[token]/status every few seconds and stays on all day,
 * so that request drives the ladder: at most one tick per THROTTLE_MS per server instance.
 * The daily Vercel cron (vercel.json) remains as a safety net.
 */
const THROTTLE_MS = 15_000;
const g = globalThis as unknown as { __nonninaLastTick?: number; __nonninaTickRunning?: boolean };

export async function maybeRunEscalationTick(now = new Date()): Promise<void> {
  const last = g.__nonninaLastTick ?? 0;
  if (g.__nonninaTickRunning || now.getTime() - last < THROTTLE_MS) return;
  g.__nonninaTickRunning = true;
  g.__nonninaLastTick = now.getTime();
  try {
    await runEscalationTick(now);
  } catch (e) {
    console.error("[escalation-heartbeat]", e);
  } finally {
    g.__nonninaTickRunning = false;
  }
}
