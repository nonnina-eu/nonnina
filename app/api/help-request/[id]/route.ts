import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_IDS, getStore } from "@/lib/db";
import type { HelpRequest } from "@/lib/db/types";
import type { HelpRequestPatch } from "@/lib/db/store";
import { jsonError, parseJson } from "@/lib/api";
import { helpRequestUpdateSchema } from "@/lib/validation";
import { getCurrentMember } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid();

/**
 * PATCH /api/help-request/:id
 *  { action: "acknowledge", relative_id? } – a relative takes the request ("I'm on it"); the tablet shows it
 *  { action: "resolve" | "reopen" }        – a family member marks the request done (or reopens it)
 * The request must belong to the member's family; the link-protected demo page may act on the
 * demo family without a session.
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
  let familyId: string | null = null;
  for (const fid of familyIds) {
    const feed = await store.getFamilyFeed(fid, 200);
    found = feed?.helpRequests.find((h) => h.id === id) ?? null;
    if (found) {
      familyId = fid;
      break;
    }
  }
  if (!found || !familyId) return jsonError(member ? 404 : 403, member ? "Not found" : "Sign in to update this request");

  let patch: HelpRequestPatch;
  if (parsed.data.action === "acknowledge") {
    // Already taken by someone: first one wins, nothing changes.
    if (found.acknowledged_at) return NextResponse.json({ ok: true, helpRequest: found });
    // Signed-in relative wins over the body; a relative id from the body must belong to this family.
    let relativeId: string | null = member?.relative?.id ?? null;
    if (!relativeId && parsed.data.relative_id) {
      const rel = await store.getRelative(parsed.data.relative_id);
      if (!rel || rel.family_id !== familyId) return jsonError(422, "Unknown relative");
      relativeId = rel.id;
    }
    patch = { acknowledged_by: relativeId, acknowledged_at: new Date().toISOString() };
  } else if (parsed.data.action === "resolve") {
    patch = { resolved_at: new Date().toISOString() };
  } else {
    patch = { resolved_at: null };
  }

  const updated = await store.updateHelpRequest(id, patch);
  if (!updated) return jsonError(404, "Not found");
  return NextResponse.json({ ok: true, helpRequest: updated });
}
