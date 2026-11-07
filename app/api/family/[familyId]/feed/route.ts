import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_IDS, getStore } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { getCurrentMember } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/family/:familyId/feed – newest events, help requests and call summaries. */
export async function GET(_request: Request, { params }: { params: Promise<{ familyId: string }> }) {
  const { familyId } = await params;
  if (!z.string().uuid().safeParse(familyId).success) return jsonError(400, "Invalid family id");
  // The demo family is public so /demo can show Anna's phone. Every other family needs a signed-in member.
  if (familyId !== DEMO_IDS.family) {
    const member = await getCurrentMember();
    if (!member) return jsonError(401, "Sign in to see this family");
    if (member.family?.id !== familyId) return jsonError(403, "This family is not yours");
  }
  const feed = await getStore().getFamilyFeed(familyId, 50);
  if (!feed) return jsonError(404, "Family not found");
  return NextResponse.json({ ok: true, ...feed }, { headers: { "Cache-Control": "no-store" } });
}
