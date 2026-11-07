import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { jsonError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/family/:familyId/feed – newest events, help requests and call summaries. */
export async function GET(_request: Request, { params }: { params: Promise<{ familyId: string }> }) {
  const { familyId } = await params;
  if (!z.string().uuid().safeParse(familyId).success) return jsonError(400, "Invalid family id");
  const feed = await getStore().getFamilyFeed(familyId, 50);
  if (!feed) return jsonError(404, "Family not found");
  return NextResponse.json({ ok: true, ...feed }, { headers: { "Cache-Control": "no-store" } });
}
