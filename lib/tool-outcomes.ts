import type { NotificationRecord } from "@/lib/db/types";

/**
 * What the ElevenLabs client tools return to Lina. Short machine-readable strings, so the
 * agent tells the senior the truth: only "relatives_notified" / "family_informed" mean that a
 * real message (SMS, call or email) left the system.
 */
export type EmergencyToolOutcome =
  | "relatives_notified"
  | "demo_mode_logged_no_sms_sent"
  | "notification_failed_tell_senior_to_call_112"
  | "warning_countdown_started";

export type HelpRequestToolOutcome =
  | "family_informed"
  | "saved_family_will_see_it_in_the_app"
  | "failed_tell_senior_to_try_again_or_press_help";

type StatusOnly = Pick<NotificationRecord, "status">;

/** Result of useEmergency().trigger(): the phase the tablet ended in plus the server's notification records. */
export interface EmergencyTriggerResult {
  phase: "none" | "countdown" | "notifying" | "notified" | "failed" | "acknowledged";
  notified: readonly StatusOnly[];
}

const delivered = (records: readonly StatusOnly[]) => records.some((r) => r.status === "sent");
const demoLogged = (records: readonly StatusOnly[]) => records.some((r) => r.status === "demo");

/** What actually happened to the messages. "demo" is a written record, not a delivery. */
export type DeliveryMode = "sent" | "demo" | "failed";

export function deliveryMode(records: readonly StatusOnly[]): DeliveryMode {
  if (delivered(records)) return "sent";
  if (demoLogged(records)) return "demo";
  return "failed";
}

/**
 * What Lina reads. `notified` is true only when an SMS, call or email left the system.
 * `mode` is the sentence key. `error` is set whenever she must not reassure the senior.
 */
export interface AgentToolResult {
  ok: boolean;
  notified: boolean;
  mode: string;
  error: string | null;
}

export function emergencyToolResult(result: EmergencyTriggerResult): AgentToolResult {
  const mode = emergencyToolOutcome(result);
  const notified = mode === "relatives_notified";
  const ok = notified || mode === "demo_mode_logged_no_sms_sent" || mode === "warning_countdown_started";
  return { ok, notified, mode, error: ok ? null : mode };
}

export function helpRequestToolResult(result: HelpRequestApiResult): AgentToolResult {
  const mode = helpRequestToolOutcome(result);
  const notified = mode === "family_informed";
  const ok = notified || mode === "saved_family_will_see_it_in_the_app";
  return { ok, notified, mode, error: ok ? null : mode };
}

export function emergencyToolOutcome(result: EmergencyTriggerResult): EmergencyToolOutcome {
  if (result.phase === "countdown") return "warning_countdown_started";
  if (result.phase !== "notified" && result.phase !== "acknowledged") return "notification_failed_tell_senior_to_call_112";
  if (delivered(result.notified)) return "relatives_notified";
  if (demoLogged(result.notified)) return "demo_mode_logged_no_sms_sent";
  return "notification_failed_tell_senior_to_call_112";
}

export interface HelpRequestApiResult {
  /** HTTP ok and body.ok: the request was stored. */
  ok: boolean;
  notified?: readonly StatusOnly[] | null;
}

export function helpRequestToolOutcome(result: HelpRequestApiResult): HelpRequestToolOutcome {
  if (!result.ok) return "failed_tell_senior_to_try_again_or_press_help";
  if (delivered(result.notified ?? [])) return "family_informed";
  // Stored, but no SMS/email left the system (demo mode, or the provider failed): the family feed still shows it.
  return "saved_family_will_see_it_in_the_app";
}
