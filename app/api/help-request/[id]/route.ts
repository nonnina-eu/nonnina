import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_IDS, getStore } from "@/lib/db";
import type { HelpRequest } from "@/lib/db/types";
import { jsonError, parseJson } from "@/lib/api";
import { helpRequestUpdateSchema } from "@/lib/validation";
import { getCurrentMember } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid();

/**
 * PATCH /api/help-request/:id  { action: "resolve" | "reopen" }
 * A family member marks a request done (or reopens it). The request must belong to the
 * member's family; the link-protected demo page may act on the demo family without a session.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Invalid id");
  const parsed = await parseJson(request, helpRequestUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const store = getStore();
  const member = await getCurrentMember();

  // The Store has no getHelpRequest: the request is only reachable through the feeds this caller may see.
  const familyIds = member?.family ? [member.family.id] : [DEMO_IDS.family];
  let found: HelpRequest | null = null;
  for (const familyId of familyIds) {
    const feed = await store.getFamilyFeed(familyId, 200);
    found = feed?.helpRequests.find((h) => h.id === id) ?? null;
    if (found) break;
  }
  if (!found) return jsonError(member ? 404 : 403, member ? "Not found" : "Sign in to update this request");

  const updated = await store.updateHelpRequest(id, {
    resolved_at: parsed.data.action === "resolve" ? new Date().toISOString() : null,
  });
  if (!updated) return jsonError(404, "Not found");
  return NextResponse.json({ ok: true, helpRequest: updated });
}
