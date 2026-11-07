import { NextResponse, type NextRequest } from "next/server";
import { demoSecretOk, resetDemo } from "@/lib/demo-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/demo/reset – clears the demo family's data. Needs x-demo-secret when DEMO_SECRET is set. */
export async function POST(request: NextRequest) {
  if (!demoSecretOk(request.headers.get("x-demo-secret"))) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  return NextResponse.json(await resetDemo());
}
