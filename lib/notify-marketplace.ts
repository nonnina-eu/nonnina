import "server-only";
import { env } from "@/lib/env";
import type { NotificationRecord } from "@/lib/db/types";

/**
 * Marketplace notifications (new request → helper, accepted / declined → family member).
 * Same contract as lib/notify.ts: never throws; Twilio SMS when configured, Resend email when
 * configured, otherwise a "demo" record carrying the text so the page can show it on screen.
 */
export interface MarketplaceRecipient {
  /** relative id when the recipient is a family member, null for a helper */
  relativeId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
}

const stamp = () => new Date().toISOString();

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Unexpected error";
}

export async function notifyMarketplaceContact(to: MarketplaceRecipient, message: { subject: string; body: string }): Promise<NotificationRecord[]> {
  const base = { relative_id: to.relativeId, name: to.name, at: stamp() };
  const records: NotificationRecord[] = [];

  if (env.twilio() && to.phone) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const msg = await client.messages.create({ to: to.phone, from: process.env.TWILIO_FROM_NUMBER!, body: message.body });
      records.push({ ...base, channel: "sms", status: "sent", detail: msg.sid });
    } catch (e) {
      records.push({ ...base, channel: "sms", status: "failed", detail: errorMessage(e) });
    }
  }

  if (env.resend() && to.email) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL || "Nonnina <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({ from, to: to.email, subject: message.subject, text: message.body });
      if (error) throw new Error(error.message);
      records.push({ ...base, channel: "email", status: "sent", detail: data?.id ?? "sent" });
    } catch (e) {
      records.push({ ...base, channel: "email", status: "failed", detail: errorMessage(e) });
    }
  }

  if (records.length === 0) {
    records.push({ ...base, channel: "demo", status: "demo", detail: message.body });
  }
  return records;
}
