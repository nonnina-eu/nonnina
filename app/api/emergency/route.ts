import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { jsonError, parseJson } from "@/lib/api";
import { emergencyRequestSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { alertsUrlFor, anyoneNotified, errorMessage, notificationRecorded, notifyRelatives } from "@/lib/notify";
import { deliveryMode } from "@/lib/tool-outcomes";
import { initialSchedule } from "@/lib/escalation-ladder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Two triggers for the same incident (keyword net + agent tool) collapse into one event. */
const DEDUPE_WINDOW_MS = 45_000;

/**
 * POST /api/emergency
 * Creates an emergency event and notifies relatives. Never blocks a first emergency:
 * the rate limit only applies when a live event for this senior already exists.
 */
export async function POST(request: Request) {
  const parsed = await parseJson(request, emergencyRequestSchema);
  if (!parsed.ok) return parsed.response;
  const { token, level, reason, quote, source } = parsed.data;

  const store = getStore();
  const ctx = await store.getSeniorByToken(token);
  if (!ctx) return jsonError(404, "Unknown device token");
  const { senior, relatives, family } = ctx;

  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const recent = await store.findRecentEmergency(senior.id, since);

  // Rate limit per senior – but a first emergency (no live event) always passes.
  const limit = rateLimit(`emergency:${senior.id}`, 10, 60_000);
  if (!limit.ok && recent) {
    return jsonError(429, "Too many emergency events, please wait a moment", { event: recent });
  }

  // Check and insert under one lock, so two fast taps cannot open two events.
  const claim = await store.claimEmergencyEvent(
    { senior_id: senior.id, level, reason, quote: quote || null, source },
    since,
  );
  if (!claim.created) {
    const mode = deliveryMode(claim.event.notified);
    return NextResponse.json({
      ok: true,
      event: claim.event,
      deduplicated: true,
      notified: anyoneNotified(claim.event.notified),
      mode,
    });
  }
  const event = claim.event;

  let notified = event.notified;
  try {
    notified = await notifyRelatives({
      senior,
      relatives,
      kind: level,
      reason,
      quote,
      alertsUrl: alertsUrlFor(family.id),
      eventId: event.id,
    });
  } catch (e) {
    notified = [{ relative_id: null, name: "system", channel: "demo", status: "failed", detail: errorMessage(e), at: new Date().toISOString() }];
  }

  // Schedule the escalation ladder (emergency only): next relative is called in 90 s unless someone confirms.
  const schedule = initialSchedule(event, relatives, family, new Date());
  const updated =
    (await store.updateEmergencyEvent(event.id, {
      notified,
      status: notificationRecorded(notified) ? "relatives_notified" : "open",
      ...schedule,
    })) ?? { ...event, notified, ...schedule };

  return NextResponse.json(
    { ok: true, event: updated, deduplicated: false, notified: anyoneNotified(notified), mode: deliveryMode(notified) },
    { status: 201 },
  );
}
