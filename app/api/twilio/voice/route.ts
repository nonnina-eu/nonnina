import { getStore } from "@/lib/db";
import { spokenEmergencyText } from "@/lib/notify";
import { asLanguage, isValidTwilioRequest, readTwilioParams, twimlResponse, voiceLang, voiceStrings } from "@/lib/twilio-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Twilio fetches this TwiML when the relative picks up the escalation call.
 * Says the emergency text and gathers one digit: 1 = "I take care of it".
 */
async function handle(request: Request): Promise<Response> {
  const params = await readTwilioParams(request);
  if (!(await isValidTwilioRequest(request, params))) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const eventId = url.searchParams.get("event") ?? "";
  const relativeId = url.searchParams.get("relative") ?? "fallback";
  const language = asLanguage(url.searchParams.get("lang"));
  const lang = voiceLang(language);
  const s = voiceStrings[language];

  const { default: twilio } = await import("twilio");
  const twiml = new twilio.twiml.VoiceResponse();

  const store = getStore();
  const event = eventId ? await store.getEmergencyEvent(eventId) : null;
  const ctx = event ? await store.getSeniorById(event.senior_id) : null;
  if (!event || !ctx) {
    twiml.say({ language: lang }, s.unknown);
    twiml.hangup();
    return twimlResponse(twiml.toString());
  }
  if (event.status === "acknowledged") {
    twiml.say({ language: lang }, s.alreadyHandled);
    twiml.hangup();
    return twimlResponse(twiml.toString());
  }
  if (event.status === "cancelled_by_senior") {
    twiml.say({ language: lang }, s.cancelled);
    twiml.hangup();
    return twimlResponse(twiml.toString());
  }

  const text = spokenEmergencyText(ctx.senior, event, language);
  const action = new URL("/api/twilio/gather", url.origin);
  action.searchParams.set("event", event.id);
  action.searchParams.set("relative", relativeId);
  action.searchParams.set("lang", language);

  const gather = twiml.gather({ numDigits: 1, action: `${action.pathname}${action.search}`, method: "POST", timeout: 6 });
  gather.say({ language: lang }, text);
  gather.pause({ length: 1 });
  gather.say({ language: lang }, text);
  twiml.say({ language: lang }, s.next);
  twiml.hangup();
  return twimlResponse(twiml.toString());
}

export async function POST(request: Request) {
  return handle(request);
}
export async function GET(request: Request) {
  return handle(request);
}
