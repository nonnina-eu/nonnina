import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { jsonError, parseJson } from "@/lib/api";
import { emergencyUpdateSchema } from "@/lib/validation";
import { alertsUrlFor, notifyRelatives } from "@/lib/notify";
import { acknowledgeEvent } from "@/lib/escalation-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const idSchema = z.string().uuid();

/** GET /api/emergency/:id – the senior screen polls this to learn that a relative is "on it". */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Invalid id");
  const event = await getStore().getEmergencyEvent(id);
  if (!event) return jsonError(404, "Not found");
  return NextResponse.json({ ok: true, event }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * PATCH /api/emergency/:id
 *  { action: "acknowledge", relative_id? } – a relative pressed "I'm on it" (stops the ladder, tells the others)
 *  { action: "cancel", token }          – the senior pressed "I'm fine" (token must match the senior)
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Invalid id");
  const parsed = await parseJson(request, emergencyUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const store = getStore();
  const event = await store.getEmergencyEvent(id);
  if (!event) return jsonError(404, "Not found");

  if (parsed.data.action === "acknowledge") {
    if (event.status === "cancelled_by_senior" || event.status === "acknowledged") return NextResponse.json({ ok: true, event });
    const updated = await acknowledgeEvent(event, parsed.data.relative_id ?? null);
    return NextResponse.json({ ok: true, event: updated });
  }

  // cancel
  const ctx = await store.getSeniorById(event.senior_id);
  if (!ctx || !parsed.data.token || ctx.senior.device_token !== parsed.data.token) {
    return jsonError(403, "Only the senior's device can cancel an event");
  }
  const wasNotified = event.notified.some((n) => n.status === "sent" || n.status === "demo");
  let notified = event.notified;
  if (wasNotified) {
    const followUp = await notifyRelatives({
      senior: ctx.senior,
      relatives: ctx.relatives,
      kind: "all_clear",
      reason: event.reason,
      alertsUrl: alertsUrlFor(ctx.family.id),
    });
    notified = [...event.notified, ...followUp];
  }
  const updated = await store.updateEmergencyEvent(id, { status: "cancelled_by_senior", notified, next_step_at: null });
  return NextResponse.json({ ok: true, event: updated, followUpSent: wasNotified });
}
