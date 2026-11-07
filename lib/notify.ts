import "server-only";
import { env } from "@/lib/env";
import type { EmergencyEvent, EmergencyLevel, NotificationRecord, Relative, Senior } from "@/lib/db/types";

/**
 * One function hides Twilio / Resend / demo mode: notifyRelatives().
 * It never throws – every failure becomes a NotificationRecord with status "failed",
 * because the emergency flow must never be blocked by a provider.
 */
export type NotifyKind = EmergencyLevel | "all_clear" | "help_request" | "acknowledged" | "nobody_confirmed";

export interface NotifyInput {
  senior: Senior;
  relatives: Relative[];
  kind: NotifyKind;
  reason: string;
  quote?: string | null;
  alertsUrl: string;
  /** For kind "acknowledged": who is taking care of it. */
  actorName?: string;
  /** For kind "emergency": the event id, so the voice call can offer "press 1". */
  eventId?: string;
}

export function buildMessage(input: NotifyInput): string {
  const { senior, kind, reason, quote, alertsUrl } = input;
  const name = senior.first_name;
  const city = senior.city;
  const q = (quote ?? "").trim();
  const actor = input.actorName?.trim() || (senior.language === "it" ? "Un familiare" : "Ein Angehöriger");
  if (senior.language === "it") {
    switch (kind) {
      case "acknowledged":
        return `Nonnina: ${actor} si sta occupando di ${name}. ${alertsUrl}`;
      case "nobody_confirmed":
        return `Nonnina: Nessuno ha confermato. Chiamare ${name} oppure il 112. ${alertsUrl}`;
      case "emergency":
        return `Nonnina: EMERGENZA per ${name} (${city}). Ha detto: "${q || reason}". Chiamare subito oppure il 112. ${alertsUrl}`;
      case "warning":
        return `Nonnina: Per favore contatti presto ${name}. Motivo: ${reason}. ${alertsUrl}`;
      case "all_clear":
        return `Nonnina: ${name} dice che ora sta bene. ${alertsUrl}`;
      case "help_request":
        return `Nonnina: ${name} ha bisogno di aiuto (non urgente): ${reason}. ${alertsUrl}`;
    }
  }
  switch (kind) {
    case "acknowledged":
      return `Nonnina: ${actor} kümmert sich um ${name}. ${alertsUrl}`;
    case "nobody_confirmed":
      return `Nonnina: Niemand hat bestätigt. Bitte ${name} anrufen oder 112 wählen. ${alertsUrl}`;
    case "emergency":
      return `Nonnina: NOTFALL bei ${name} (${city}). Sie sagte: "${q || reason}". Bitte sofort anrufen oder 112 wählen. ${alertsUrl}`;
    case "warning":
      return `Nonnina: Bitte melden Sie sich bald bei ${name}. Grund: ${reason}. ${alertsUrl}`;
    case "all_clear":
      return `Nonnina: ${name} sagt, es geht ihr jetzt wieder gut. ${alertsUrl}`;
    case "help_request":
      return `Nonnina: ${name} braucht Hilfe (nicht dringend): ${reason}. ${alertsUrl}`;
  }
}

const stamp = () => new Date().toISOString();

async function sendSms(to: string, body: string): Promise<string> {
  const twilio = (await import("twilio")).default;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const msg = await client.messages.create({ to, from: process.env.TWILIO_FROM_NUMBER!, body });
  return msg.sid;
}

/** What the voice call says to a relative. Spoken twice, then "press 1". */
export function spokenEmergencyText(senior: Senior, event: Pick<EmergencyEvent, "reason" | "quote">, language: Senior["language"] = senior.language): string {
  const said = (event.quote ?? "").trim() || event.reason;
  if (language === "it") {
    return `Qui è Nonnina. ${senior.first_name} a ${senior.city} ha bisogno di aiuto. Ha detto: "${said}". Premi 1 se te ne occupi. Altrimenti chiamiamo la prossima persona.`;
  }
  return `Hier ist Nonnina. ${senior.first_name} in ${senior.city} braucht Hilfe. Sie sagte: "${said}". Drücken Sie die 1, wenn Sie sich kümmern. Sonst rufen wir die nächste Person an.`;
}

export function voiceWebhookUrl(eventId: string, relativeId: string, language: Senior["language"]): string {
  const u = new URL(`${env.appUrl()}/api/twilio/voice`);
  u.searchParams.set("event", eventId);
  u.searchParams.set("relative", relativeId);
  u.searchParams.set("lang", language);
  return u.toString();
}

/**
 * Places the "press 1 if you take care of it" call. The TwiML is served by /api/twilio/voice so the
 * call can Gather a key press. Never throws; in demo mode (no Twilio) records what would be said.
 */
export async function callRelativeWithGather(input: {
  to: string;
  senior: Senior;
  event: Pick<EmergencyEvent, "id" | "reason" | "quote">;
  /** relative id, or "fallback" for the family's fallback number */
  relativeId: string;
  relativeName: string;
}): Promise<NotificationRecord> {
  const { to, senior, event, relativeId, relativeName } = input;
  const base = { relative_id: relativeId === "fallback" ? null : relativeId, name: relativeName, at: stamp() };
  const text = spokenEmergencyText(senior, event);
  if (!env.twilio()) {
    return { ...base, channel: "call", status: "demo", detail: text };
  }
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER!,
      url: voiceWebhookUrl(event.id, relativeId, senior.language),
      method: "POST",
      timeout: 25,
    });
    return { ...base, channel: "call", status: "sent", detail: call.sid };
  } catch (e) {
    return { ...base, channel: "call", status: "failed", detail: errorMessage(e) };
  }
}

async function sendEmail(to: string, subject: string, text: string): Promise<string> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL || "Nonnina <onboarding@resend.dev>";
  const { data, error } = await resend.emails.send({ from, to, subject, text });
  if (error) throw new Error(error.message);
  return data?.id ?? "sent";
}

function subjectFor(kind: NotifyKind, senior: Senior): string {
  const name = senior.first_name;
  if (senior.language === "it") {
    if (kind === "acknowledged") return `Qualcuno si occupa di ${name}`;
    if (kind === "nobody_confirmed") return `Nessuno ha confermato per ${name}`;
    return kind === "emergency" ? `EMERGENZA: ${name}` : kind === "warning" ? `Controlla ${name}` : kind === "all_clear" ? `${name} sta bene` : `Richiesta di aiuto di ${name}`;
  }
  if (kind === "acknowledged") return `Jemand kümmert sich um ${name}`;
  if (kind === "nobody_confirmed") return `Niemand hat für ${name} bestätigt`;
  return kind === "emergency" ? `NOTFALL: ${name}` : kind === "warning" ? `Bitte bei ${name} melden` : kind === "all_clear" ? `${name} geht es gut` : `Hilfe-Anfrage von ${name}`;
}

/**
 * Notifies every relative according to their preferences.
 * - Twilio configured: SMS to notify_sms relatives; voice call to the priority-1 relative on "emergency".
 * - Otherwise demo mode: records are written (and an email is sent when Resend is configured).
 */
export async function notifyRelatives(input: NotifyInput): Promise<NotificationRecord[]> {
  const { relatives, kind, senior } = input;
  const body = buildMessage(input);
  const records: NotificationRecord[] = [];
  const ordered = [...relatives].sort((a, b) => a.priority - b.priority);
  const smsEnabled = env.twilio();
  const emailEnabled = env.resend();

  await Promise.all(
    ordered.map(async (rel) => {
      const base = { relative_id: rel.id, name: rel.name, at: stamp() };

      if (smsEnabled && rel.notify_sms && rel.phone) {
        try {
          const sid = await sendSms(rel.phone, body);
          records.push({ ...base, channel: "sms", status: "sent", detail: sid });
        } catch (e) {
          records.push({ ...base, channel: "sms", status: "failed", detail: errorMessage(e) });
        }
      } else if (!smsEnabled) {
        records.push({ ...base, channel: "demo", status: "demo", detail: body });
      }

      if (smsEnabled && kind === "emergency" && rel.notify_call && rel.priority === 1 && rel.phone) {
        records.push(
          await callRelativeWithGather({
            to: rel.phone,
            senior,
            event: { id: input.eventId ?? "", reason: input.reason, quote: input.quote ?? null },
            relativeId: rel.id,
            relativeName: rel.name,
          }),
        );
      }

      if (emailEnabled && rel.email) {
        try {
          const id = await sendEmail(rel.email, subjectFor(kind, senior), body);
          records.push({ ...base, channel: "email", status: "sent", detail: id });
        } catch (e) {
          records.push({ ...base, channel: "email", status: "failed", detail: errorMessage(e) });
        }
      }
    }),
  );

  return records;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export function anyoneNotified(records: NotificationRecord[]): boolean {
  return records.some((r) => r.status === "sent" || r.status === "demo");
}

export function alertsUrlFor(familyId: string): string {
  return `${env.appUrl()}/family/${familyId}/alerts`;
}

export function describeEvent(event: EmergencyEvent): string {
  return `${event.level}:${event.reason}`;
}
