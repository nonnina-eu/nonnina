import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { SeniorContext } from "@/lib/db/types";
import { formatReminder, nextReminder } from "@/lib/time";

export const ELEVENLABS_API = "https://api.elevenlabs.io";

/** Dynamic variables injected into the agent prompt. Names must match docs/elevenlabs-agent.md. */
export function dynamicVariablesFor(ctx: SeniorContext, now = new Date()): Record<string, string> {
  const { senior, relatives } = ctx;
  const names = relatives.sort((a, b) => a.priority - b.priority).map((r) => r.name);
  const joined = names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} ${senior.language === "de" ? "und" : "e"} ${names[names.length - 1]}`;
  return {
    senior_name: senior.first_name,
    language: senior.language === "de" ? "German" : "Italian",
    language_code: senior.language,
    city: senior.city,
    next_medication: formatReminder(nextReminder(senior.medication_times, now), senior.language),
    relatives_names: joined || (senior.language === "de" ? "Ihre Familie" : "la sua famiglia"),
    senior_token: senior.device_token,
  };
}

export async function getSignedUrl(agentId: string, apiKey: string): Promise<string> {
  const res = await fetch(`${ELEVENLABS_API}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`, {
    headers: { "xi-api-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs signed-url failed (${res.status})`);
  }
  const data = (await res.json()) as { signed_url?: string };
  if (!data.signed_url) throw new Error("ElevenLabs returned no signed_url");
  return data.signed_url;
}

/**
 * Verifies the `ElevenLabs-Signature` header: "t=<unix>,v0=<hex hmac sha256 of `${t}.${body}`>".
 * Rejects stale timestamps (older than 30 minutes).
 */
export function verifyWebhookSignature(header: string | null, body: string, secret: string, now = Date.now()): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=") as [string, string]));
  const t = parts.t;
  const v0 = parts.v0;
  if (!t || !v0) return false;
  const ts = Number(t) * 1000;
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 30 * 60 * 1000) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v0.replace(/^v0=/, ""));
  return a.length === b.length && timingSafeEqual(a, b);
}
