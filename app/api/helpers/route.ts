import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { DEFAULT_CITY } from "@/lib/marketplace";
import { helperQuerySchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/helpers?service=shopping&city=Stuttgart&language=it&verified=1
 * Public directory for the voice agent tools and other clients. Safe columns only: never phone,
 * email or user id. City defaults to Stuttgart; `city=*` lists every city.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Object.fromEntries([...url.searchParams.entries()].filter(([, v]) => v !== ""));
  const parsed = helperQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(422, "Validation failed", { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  const { service, language, verified } = parsed.data;
  const city = parsed.data.city === "*" ? undefined : (parsed.data.city ?? DEFAULT_CITY);
  const helpers = await getStore().listHelpers({ service, city, language, verifiedOnly: verified === "1" || verified === "true" });
  return NextResponse.json(
    {
      ok: true,
      count: helpers.length,
      helpers: helpers.map((h) => ({ ...h, url: `/helpers/${h.id}` })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
