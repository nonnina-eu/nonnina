import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { maybeRunEscalationTick } from "@/lib/escalation-heartbeat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

const tokenSchema = z.string().min(3).max(120);

/** A taken help request stays on the tablet this long (or until someone marks it done). */
const HELP_WINDOW_MS = 12 * 60 * 60 * 1000;
/** Only recent emergencies count as "active" for the tablet. */
const EMERGENCY_WINDOW_MS = 60 * 60 * 1000;

/**
 * GET /api/senior/:token/status – polled by the senior tablet every few seconds.
 * The device token is the only credential, so the response carries only what the screen shows:
 * the latest help request a relative took ("Anna kümmert sich um: …") and the active emergency, if any.
 */
export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  if (!tokenSchema.safeParse(token).success) return jsonError(400, "Invalid token");

  // The always-on tablet drives the escalation ladder (no per-minute cron on Vercel Hobby).
  await maybeRunEscalationTick();

  const store = getStore();
  const ctx = await store.getSeniorByToken(token);
  if (!ctx) return jsonError(404, "Unknown device token");
  const now = Date.now();
  const nameOf = (id: string | null) => (id ? (ctx.relatives.find((r) => r.id === id)?.name ?? null) : null);

  const [help, event] = await Promise.all([
    store.findAcknowledgedHelpRequest(ctx.senior.id, new Date(now - HELP_WINDOW_MS)),
    store.findRecentEmergency(ctx.senior.id, new Date(now - EMERGENCY_WINDOW_MS)),
  ]);

  return NextResponse.json(
    {
      ok: true,
      helpRequest: help
        ? { id: help.id, summary: help.summary, acknowledgedBy: nameOf(help.acknowledged_by), acknowledgedAt: help.acknowledged_at }
        : null,
      emergency: event ? { id: event.id, level: event.level, status: event.status, acknowledgedBy: nameOf(event.acknowledged_by) } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
