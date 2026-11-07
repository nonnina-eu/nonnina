import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { jsonError, parseJson } from "@/lib/api";
import { helpRequestSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { alertsUrlFor, notifyRelatives } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/help-request – non-urgent request created by the agent tool `create_help_request`. */
export async function POST(request: Request) {
  const parsed = await parseJson(request, helpRequestSchema);
  if (!parsed.ok) return parsed.response;
  const { token, category, summary } = parsed.data;

  const store = getStore();
  const ctx = await store.getSeniorByToken(token);
  if (!ctx) return jsonError(404, "Unknown device token");

  if (!rateLimit(`help:${ctx.senior.id}`, 20, 60_000).ok) {
    return jsonError(429, "Too many help requests, please wait a moment");
  }

  const helpRequest = await store.createHelpRequest({
    senior_id: ctx.senior.id,
    category,
    summary,
    status: "open",
  });

  // Non-urgent: only the first-priority relative gets a message.
  const primary = ctx.relatives.filter((r) => r.priority === 1);
  const notified = await notifyRelatives({
    senior: ctx.senior,
    relatives: primary,
    kind: "help_request",
    reason: summary,
    alertsUrl: alertsUrlFor(ctx.family.id),
  });

  return NextResponse.json({ ok: true, helpRequest, notified }, { status: 201 });
}
