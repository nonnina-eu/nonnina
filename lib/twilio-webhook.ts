import "server-only";
import type { Language } from "@/lib/db/types";

/**
 * Helpers shared by the Twilio voice webhooks. Twilio posts form-encoded bodies and signs
 * the full request URL + params with the account auth token (X-Twilio-Signature).
 */
export async function readTwilioParams(request: Request): Promise<Record<string, string>> {
  if (request.method === "GET") return Object.fromEntries(new URL(request.url).searchParams.entries());
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text).entries());
}

/** The public URL Twilio signed – behind Vercel the request URL is http://, so rebuild from headers. */
export function publicUrl(request: Request): string {
  const u = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? u.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? u.host;
  return `${proto}://${host}${u.pathname}${u.search}`;
}

export async function isValidTwilioRequest(request: Request, params: Record<string, string>): Promise<boolean> {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const { validateRequest } = await import("twilio");
  // GET requests are signed over the URL only; POST over URL + body params.
  const signedParams = request.method === "GET" ? {} : params;
  return validateRequest(token, signature, publicUrl(request), signedParams);
}

export function twimlResponse(xml: string, status = 200): Response {
  return new Response(xml, { status, headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" } });
}

export function voiceLang(lang: string | null | undefined): "de-DE" | "it-IT" {
  return lang === "it" ? "it-IT" : "de-DE";
}

export function asLanguage(lang: string | null | undefined): Language {
  return lang === "it" ? "it" : "de";
}

export const voiceStrings = {
  de: {
    thanks: "Danke. Wir sagen den anderen Bescheid.",
    next: "Verstanden. Wir rufen die nächste Person an.",
    alreadyHandled: "Danke, es kümmert sich bereits jemand.",
    cancelled: "Entwarnung. Es geht wieder gut.",
    unknown: "Dieser Anruf ist nicht mehr gültig.",
  },
  it: {
    thanks: "Grazie. Avvisiamo gli altri.",
    next: "Capito. Chiamiamo la prossima persona.",
    alreadyHandled: "Grazie, qualcuno se ne sta già occupando.",
    cancelled: "Tutto bene, l'allarme è rientrato.",
    unknown: "Questa chiamata non è più valida.",
  },
} as const;
