import { NextResponse } from "next/server";
import { DEMO_IDS, getStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/demo/reset – clears events, help requests and sessions of the demo family only. */
export async function POST() {
  await getStore().resetDemoData(DEMO_IDS.family);
  return NextResponse.json({ ok: true });
}
