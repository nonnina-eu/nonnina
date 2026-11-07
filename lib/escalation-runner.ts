import "server-only";
import { getStore } from "@/lib/db";
import type { EmergencyEvent, NotificationRecord } from "@/lib/db/types";
import { planNextStep, type LadderAction } from "@/lib/escalation-ladder";
import { alertsUrlFor, callRelativeWithGather, errorMessage, notificationRecorded, notifyRelatives } from "@/lib/notify";

export interface TickResult {
  id: string;
  action: LadderAction["kind"];
  nextStepAt: string | null;
  error?: string;
}

/**
 * One tick of the escalation ladder: every live emergency whose next step is due moves one step.
 * Called by the Vercel cron every minute, and usable from server code (demo "advance" button).
 */
export async function runEscalationTick(now = new Date()): Promise<TickResult[]> {
  const store = getStore();
  const due = await store.findEventsDueForEscalation(now, 20);
  const results: TickResult[] = [];

  for (const event of due) {
    try {
      const ctx = await store.getSeniorById(event.senior_id);
      if (!ctx) {
        await store.updateEmergencyEvent(event.id, { next_step_at: null });
        results.push({ id: event.id, action: "done", nextStepAt: null, error: "senior not found" });
        continue;
      }
      const { senior, relatives, family } = ctx;
      const plan = planNextStep(event, relatives, family, now);
      const records: NotificationRecord[] = [];

      switch (plan.action.kind) {
        case "call_relative": {
          const r = plan.action.relative;
          records.push(await callRelativeWithGather({ to: r.phone!, senior, event, relativeId: r.id, relativeName: r.name }));
          break;
        }
        case "call_fallback":
          records.push(
            await callRelativeWithGather({
              to: plan.action.phone,
              senior,
              event,
              relativeId: "fallback",
              relativeName: senior.language === "it" ? "Numero di riserva" : "Notfallnummer der Familie",
            }),
          );
          break;
        case "nobody_confirmed":
          records.push(
            ...(await notifyRelatives({
              senior,
              relatives,
              kind: "nobody_confirmed",
              reason: event.reason,
              quote: event.quote,
              alertsUrl: alertsUrlFor(family.id),
            })),
          );
          break;
        case "done":
          break;
      }

      await store.updateEmergencyEvent(event.id, {
        escalation_step: plan.nextStep,
        next_step_at: plan.nextStepAt,
        notified: [...event.notified, ...records],
      });
      results.push({ id: event.id, action: plan.action.kind, nextStepAt: plan.nextStepAt });
    } catch (e) {
      results.push({ id: event.id, action: "done", nextStepAt: event.next_step_at, error: errorMessage(e) });
    }
  }
  return results;
}

/**
 * A relative confirmed ("I'm on it" in the app, or key 1 in the call).
 * Stops the ladder and tells the other relatives. Idempotent.
 */
export async function acknowledgeEvent(event: EmergencyEvent, relativeId: string | null): Promise<EmergencyEvent> {
  const store = getStore();
  if (event.status === "acknowledged" || event.status === "cancelled_by_senior") return event;

  const ctx = await store.getSeniorById(event.senior_id);
  let records: NotificationRecord[] = [];
  const wasNotified = notificationRecorded(event.notified);
  if (ctx && wasNotified) {
    const actor = relativeId ? ctx.relatives.find((r) => r.id === relativeId) : undefined;
    const others = ctx.relatives.filter((r) => r.id !== relativeId);
    records = await notifyRelatives({
      senior: ctx.senior,
      relatives: others,
      kind: "acknowledged",
      reason: event.reason,
      quote: event.quote,
      alertsUrl: alertsUrlFor(ctx.family.id),
      actorName: actor?.name,
    });
  }
  const updated = await store.updateEmergencyEvent(event.id, {
    status: "acknowledged",
    acknowledged_by: relativeId,
    next_step_at: null,
    notified: [...event.notified, ...records],
  });
  return updated ?? { ...event, status: "acknowledged", acknowledged_by: relativeId, next_step_at: null };
}
