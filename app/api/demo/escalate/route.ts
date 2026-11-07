import { NextResponse, type NextRequest } from "next/server";
import { demoSecretOk, escalateDemo } from "@/lib/demo-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/demo/escalate – demo only: makes the demo family's live emergencies due now and runs
 * one escalation tick, so the 90 s ladder can be shown without waiting. Needs x-demo-secret when DEMO_SECRET is set.
 */
export async function POST(request: NextRequest) {
  if (!demoSecretOk(request.headers.get("x-demo-secret"))) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const result = await escalateDemo();
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
