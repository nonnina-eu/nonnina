import "server-only";
import { env } from "@/lib/env";
import type { EmergencyEvent, EmergencyLevel, NotificationRecord, Relative, Senior } from "@/lib/db/types";

/**
 * One function hides Twilio / Resend / demo mode: notifyRelatives().
 * It never throws – every failure becomes a NotificationRecord with status "failed",
 * because the emergency flow must never be blocked by a provider.
 */
export type NotifyKind = EmergencyLevel | "all_clear" | "help_request";

export interface NotifyInput {
  senior: Senior;
  relatives: Relative[];
  kind: NotifyKind;
  reason: string;
  quote?: string | null;
  alertsUrl: string;
}

export function buildMessage(input: NotifyInput): string {
  const { senior, kind, reason, quote, alertsUrl } = input;
  const name = senior.first_name;
  const city = senior.city;
  const q = (quote ?? "").trim();
  if (senior.language === "it") {
    switch (kind) {
      case "emergency":
        return `Care Copilot: EMERGENZA per ${name} (${city}). Ha detto: "${q || reason}". Chiamare subito oppure il 112. ${alertsUrl}`;
      case "warning":
        return `Care Copilot: Per favore contatti presto ${name}. Motivo: ${reason}. ${alertsUrl}`;
      case "all_clear":
        return `Care Copilot: ${name} dice che ora sta bene. ${alertsUrl}`;
      case "help_request":
        return `Care Copilot: ${name} ha bisogno di aiuto (non urgente): ${reason}. ${alertsUrl}`;
    }
  }
  switch (kind) {
    case "emergency":
      return `Care Copilot: NOTFALL bei ${name} (${city}). Sie sagte: "${q || reason}". Bitte sofort anrufen oder 112 wählen. ${alertsUrl}`;
    case "warning":
      return `Care Copilot: Bitte melden Sie sich bald bei ${name}. Grund: ${reason}. ${alertsUrl}`;
    case "all_clear":
      return `Care Copilot: ${name} sagt, es geht ihr jetzt wieder gut. ${alertsUrl}`;
    case "help_request":
      return `Care Copilot: ${name} braucht Hilfe (nicht dringend): ${reason}. ${alertsUrl}`;
  }
}

const stamp = () => new Date().toISOString();

async function sendSms(to: string, body: string): Promise<string> {
  const twilio = (await import("twilio")).default;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const msg = await client.messages.create({ to, from: process.env.TWILIO_FROM_NUMBER!, body });
  return msg.sid;
}

async function placeCall(to: string, text: string, language: Senior["language"]): Promise<string> {
  const twilio = (await import("twilio")).default;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const voiceLang = language === "de" ? "de-DE" : "it-IT";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const twiml = `<Response><Say language="${voiceLang}">${escaped}</Say><Pause length="1"/><Say language="${voiceLang}">${escaped}</Say></Response>`;
  const call = await client.calls.create({ to, from: process.env.TWILIO_FROM_NUMBER!, twiml });
  return call.sid;
}

async function sendEmail(to: string, subject: string, text: string): Promise<string> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL || "Care Copilot <onboarding@resend.dev>";
  const { data, error } = await resend.emails.send({ from, to, subject, text });
  if (error) throw new Error(error.message);
  return data?.id ?? "sent";
}

function subjectFor(kind: NotifyKind, senior: Senior): string {
  const name = senior.first_name;
  if (senior.language === "it") {
    return kind === "emergency" ? `EMERGENZA: ${name}` : kind === "warning" ? `Controlla ${name}` : kind === "all_clear" ? `${name} sta bene` : `Richiesta di aiuto di ${name}`;
  }
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
        try {
          const sid = await placeCall(rel.phone, body, senior.language);
          records.push({ ...base, channel: "call", status: "sent", detail: sid });
        } catch (e) {
          records.push({ ...base, channel: "call", status: "failed", detail: errorMessage(e) });
        }
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
