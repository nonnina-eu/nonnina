import type { EmergencyEvent, Family, Relative } from "@/lib/db/types";

/**
 * The escalation ladder – pure functions, no I/O.
 *
 * Step 0 is the initial notification (SMS to everyone, voice call to the priority-1 relative when
 * they want calls). Every STEP_INTERVAL_MS without an acknowledgement the ladder moves one step:
 *   1..n  voice call to the next relative with a phone (priority order, skipping the one already called)
 *   n+1   voice call to the family's fallback number (if set)
 *   n+2   SMS to everyone: "nobody confirmed, please call Maria or 112"
 *   then  done
 * Only "emergency" level events climb the ladder. "warning" never does.
 */
export const STEP_INTERVAL_MS = 90_000;

export type LadderAction =
  | { kind: "call_relative"; relative: Relative }
  | { kind: "call_fallback"; phone: string }
  | { kind: "nobody_confirmed" }
  | { kind: "done" };

export interface LadderPlan {
  action: LadderAction;
  /** The escalation_step value to store after executing `action`. */
  nextStep: number;
  /** When the step after this one is due; null when the ladder is finished. */
  nextStepAt: string | null;
}

/** The priority-1 relative is called at t=0 when they have a phone and want calls. */
export function calledInitially(relatives: Relative[]): Relative | null {
  const primary = [...relatives].sort((a, b) => a.priority - b.priority)[0];
  return primary && primary.phone && primary.notify_call ? primary : null;
}

/** Ordered list of every action after step 0. */
export function ladderActions(relatives: Relative[], family: Family): LadderAction[] {
  const initial = calledInitially(relatives);
  const calls: LadderAction[] = [...relatives]
    .sort((a, b) => a.priority - b.priority)
    .filter((r) => Boolean(r.phone) && r.id !== initial?.id)
    .map((relative) => ({ kind: "call_relative" as const, relative }));
  if (family.fallback_phone) calls.push({ kind: "call_fallback", phone: family.fallback_phone });
  // Only worth telling everyone "nobody confirmed" when there was someone to ask.
  const anyoneReachable = relatives.some((r) => Boolean(r.phone)) || Boolean(family.fallback_phone);
  if (anyoneReachable) calls.push({ kind: "nobody_confirmed" });
  return calls;
}

export function planNextStep(event: EmergencyEvent, relatives: Relative[], family: Family, now: Date): LadderPlan {
  const actions = ladderActions(relatives, family);
  const index = event.escalation_step; // step k executed → actions[k-1]; next is actions[index]
  const action = actions[index] ?? { kind: "done" as const };
  if (action.kind === "done") return { action, nextStep: event.escalation_step, nextStepAt: null };
  const nextStep = event.escalation_step + 1;
  const hasMore = nextStep < actions.length;
  return {
    action,
    nextStep,
    nextStepAt: hasMore ? new Date(now.getTime() + STEP_INTERVAL_MS).toISOString() : null,
  };
}

export function initialSchedule(
  event: Pick<EmergencyEvent, "level">,
  relatives: Relative[],
  family: Family,
  now: Date,
): { escalation_step: number; next_step_at: string | null } {
  if (event.level !== "emergency") return { escalation_step: 0, next_step_at: null };
  const actions = ladderActions(relatives, family);
  if (actions.length === 0) return { escalation_step: 0, next_step_at: null };
  return { escalation_step: 0, next_step_at: new Date(now.getTime() + STEP_INTERVAL_MS).toISOString() };
}
