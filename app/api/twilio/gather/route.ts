import { getStore } from "@/lib/db";
import { acknowledgeEvent } from "@/lib/escalation-runner";
import { asLanguage, isValidTwilioRequest, readTwilioParams, twimlResponse, voiceLang, voiceStrings } from "@/lib/twilio-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Twilio posts the pressed digit here. "1" acknowledges the event and stops the ladder. */
export async function POST(request: Request) {
  const params = await readTwilioParams(request);
  if (!(await isValidTwilioRequest(request, params))) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const eventId = url.searchParams.get("event") ?? "";
  const relativeParam = url.searchParams.get("relative") ?? "fallback";
  const language = asLanguage(url.searchParams.get("lang"));
  const lang = voiceLang(language);
  const s = voiceStrings[language];

  const { default: twilio } = await import("twilio");
  const twiml = new twilio.twiml.VoiceResponse();

  const event = eventId ? await getStore().getEmergencyEvent(eventId) : null;
  if (!event) {
    twiml.say({ language: lang }, s.unknown);
  } else if (event.status === "cancelled_by_senior") {
    twiml.say({ language: lang }, s.cancelled);
  } else if (event.status === "acknowledged") {
    twiml.say({ language: lang }, s.alreadyHandled);
  } else if (params.Digits === "1") {
    await acknowledgeEvent(event, relativeParam === "fallback" ? null : relativeParam);
    twiml.say({ language: lang }, s.thanks);
  } else {
    twiml.say({ language: lang }, s.next);
  }
  twiml.hangup();
  return twimlResponse(twiml.toString());
}
