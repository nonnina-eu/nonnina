import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { Mood } from "@/lib/db/types";
import { jsonError } from "@/lib/api";
import { postCallWebhookSchema } from "@/lib/validation";
import { verifyWebhookSignature } from "@/lib/elevenlabs";
import { shouldEscalate, toHelpCategory } from "@/lib/escalation";
import { alertsUrlFor, notifyRelatives } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOODS: readonly Mood[] = ["good", "ok", "low", "worried"];

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function asBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "yes", "ja", "sì", "si"].includes(v.toLowerCase());
  return null;
}

/**
 * POST /api/elevenlabs/webhook – post-call transcription webhook.
 * Verifies the HMAC signature, stores summary/mood/category/needs_human and
 * escalates to the family when needed.
 */
export async function POST(request: Request) {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const body = await request.text();
  if (!secret) return jsonError(503, "Webhook secret not configured");
  if (!verifyWebhookSignature(request.headers.get("elevenlabs-signature"), body, secret)) {
    return jsonError(401, "Invalid signature");
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return jsonError(400, "Invalid JSON");
  }
  const parsed = postCallWebhookSchema.safeParse(json);
  if (!parsed.success) return jsonError(422, "Unexpected payload");
  const { data, type } = parsed.data;
  if (type && type !== "post_call_transcription") return NextResponse.json({ ok: true, ignored: type });

  const token = asString(data.conversation_initiation_client_data?.dynamic_variables?.senior_token);
  if (!token) return NextResponse.json({ ok: true, ignored: "no senior_token" }, { status: 202 });

  const store = getStore();
  const ctx = await store.getSeniorByToken(token);
  if (!ctx) return NextResponse.json({ ok: true, ignored: "unknown senior" }, { status: 202 });

  const results = data.analysis?.data_collection_results ?? {};
  const moodRaw = asString(results.mood?.value)?.toLowerCase();
  const mood = (MOODS as readonly string[]).includes(moodRaw ?? "") ? (moodRaw as Mood) : null;
  const summary = asString(results.summary?.value) ?? asString(data.analysis?.transcript_summary);
  const problemCategory = asString(results.problem_category?.value);
  const needsHuman = asBool(results.needs_human?.value) ?? false;

  await store.createVoiceSession({
    senior_id: ctx.senior.id,
    conversation_id: data.conversation_id,
    summary,
    mood,
    problem_category: problemCategory,
    needs_human: needsHuman,
  });

  let escalated = false;
  if (shouldEscalate({ needs_human: needsHuman, problem_category: problemCategory })) {
    escalated = true;
    const category = toHelpCategory(problemCategory);
    const text = summary ?? (ctx.senior.language === "de" ? "Bitte nach dem letzten Gespräch nachfragen." : "Si prega di chiedere dell'ultima conversazione.");
    await store.createHelpRequest({ senior_id: ctx.senior.id, category, summary: text, status: "escalated" });
    await notifyRelatives({
      senior: ctx.senior,
      relatives: ctx.relatives.filter((r) => r.priority === 1),
      kind: "help_request",
      reason: text,
      alertsUrl: alertsUrlFor(ctx.family.id),
    });
  }

  return NextResponse.json({ ok: true, escalated });
}
