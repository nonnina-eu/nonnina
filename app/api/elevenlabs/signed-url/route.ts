import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, parseJson } from "@/lib/api";
import { signedUrlSchema } from "@/lib/validation";
import { dynamicVariablesFor, getSignedUrl } from "@/lib/elevenlabs";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/elevenlabs/signed-url
 * The API key stays on the server. Returns a short-lived signed URL plus the
 * dynamic variables for this senior.
 */
export async function POST(request: Request) {
  const parsed = await parseJson(request, signedUrlSchema);
  if (!parsed.ok) return parsed.response;

  const ctx = await getStore().getSeniorByToken(parsed.data.token);
  if (!ctx) return jsonError(404, "Unknown device token");

  if (!env.elevenlabs()) {
    return jsonError(503, "Voice is not configured", { code: "voice_unavailable" });
  }
  if (!rateLimit(`signed-url:${ctx.senior.id}`, 30, 60_000).ok) {
    return jsonError(429, "Too many sessions, please wait a moment");
  }

  try {
    const signedUrl = await getSignedUrl(process.env.ELEVENLABS_AGENT_ID!, process.env.ELEVENLABS_API_KEY!);
    return NextResponse.json({ ok: true, signedUrl, dynamicVariables: dynamicVariablesFor(ctx) });
  } catch (e) {
    console.error("[signed-url]", e);
    return jsonError(502, "Could not start the voice session", { code: "voice_error" });
  }
}
