import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getStore, DEMO_IDS } from "@/lib/db";
import type { Family, FamilyOverview, Relative } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const DEMO_COOKIE = "nonnina_family";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
/** Placeholder cookie value for a demo visitor without a family yet. */
export const DEMO_NEW = "new";

export type AuthMode = "supabase" | "demo";

export interface CurrentMember {
  mode: AuthMode;
  /** Supabase auth user id (null in demo mode). */
  userId: string | null;
  email: string | null;
  /** The relative row of the signed-in person. Null right after sign-in, before onboarding. */
  relative: Relative | null;
  family: Family | null;
}

export function authMode(): AuthMode {
  return env.supabase() ? "supabase" : "demo";
}

// ---------- demo cookie (HMAC-signed, httpOnly) ----------

function secret(): string {
  return process.env.AUTH_SECRET || "nonnina-dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 32);
}

export function encodeDemoCookie(relativeId: string, familyId: string): string {
  const payload = `${relativeId}:${familyId}`;
  return `${payload}:${sign(payload)}`;
}

export function decodeDemoCookie(value: string | undefined): { relativeId: string; familyId: string } | null {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length !== 3) return null;
  const [relativeId, familyId, sig] = parts;
  const expected = sign(`${relativeId}:${familyId}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { relativeId, familyId };
}

export async function setDemoMemberCookie(relativeId: string, familyId: string): Promise<void> {
  const store = await cookies();
  store.set(DEMO_COOKIE, encodeDemoCookie(relativeId, familyId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearDemoMemberCookie(): Promise<void> {
  const store = await cookies();
  store.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
}

// ---------- current member ----------

/**
 * Who is using the family area. Supabase mode: the auth user, resolved to a relative via
 * relatives.user_id. Demo mode: the signed cookie. Returns null when nobody is signed in.
 */
export async function getCurrentMember(): Promise<CurrentMember | null> {
  if (authMode() === "supabase") {
    const supabase = await createClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const overview = await getStore().getFamilyForUser(user.id);
    const relative = overview?.relatives.find((r) => r.user_id === user.id) ?? null;
    return { mode: "supabase", userId: user.id, email: user.email ?? null, relative, family: overview?.family ?? null };
  }

  const jar = await cookies();
  const decoded = decodeDemoCookie(jar.get(DEMO_COOKIE)?.value);
  if (!decoded) return null;
  // "new:new" = a demo visitor who started the wizard but has no family yet.
  if (decoded.familyId === DEMO_NEW) return { mode: "demo", userId: null, email: null, relative: null, family: null };
  const store = getStore();
  const [relative, overview] = await Promise.all([store.getRelative(decoded.relativeId), store.getFamilyOverview(decoded.familyId)]);
  if (!overview) return null;
  if (relative && relative.family_id !== overview.family.id) return null;
  return { mode: "demo", userId: null, email: relative?.email ?? null, relative, family: overview.family };
}

/** For /app pages: redirects to /login when signed out, to /app/setup when the family is missing. */
export async function requireMember(options: { allowNoFamily?: boolean } = {}): Promise<CurrentMember> {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/app");
  if (!member.family && !options.allowNoFamily) redirect("/app/setup");
  return member;
}

export async function getMemberOverview(member: CurrentMember): Promise<FamilyOverview | null> {
  if (!member.family) return null;
  return getStore().getFamilyOverview(member.family.id);
}

/** True when a senior belongs to the member's family (used before every write). */
export function ownsSenior(overview: FamilyOverview | null, seniorId: string): boolean {
  return Boolean(overview?.seniors.some((s) => s.id === seniorId));
}

export function ownsRelative(overview: FamilyOverview | null, relativeId: string): boolean {
  return Boolean(overview?.relatives.some((r) => r.id === relativeId));
}

export function isDemoFamily(familyId: string): boolean {
  return familyId === DEMO_IDS.family;
}
