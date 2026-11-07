import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { authMode, type AuthMode } from "@/lib/auth";
import { getStore } from "@/lib/db";
import type { Helper } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Who is using the helper area (/helpers/join, /helpers/me).
 * Supabase mode: the auth user (same magic link as the family login), resolved via helpers.user_id.
 * Demo mode: a signed httpOnly cookie `nonnina_helper` = `<helperId>:<hmac>`, next to the family cookie.
 */
export const HELPER_COOKIE = "nonnina_helper";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface HelperSession {
  mode: AuthMode;
  userId: string | null;
  email: string | null;
  /** Null when signed in (Supabase) but no profile yet. */
  helper: Helper | null;
}

function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET || "nonnina-dev-secret-change-me";
  return createHmac("sha256", secret).update(`helper:${payload}`).digest("hex").slice(0, 32);
}

export function encodeHelperCookie(helperId: string): string {
  return `${helperId}:${sign(helperId)}`;
}

export function decodeHelperCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [helperId, sig, ...rest] = value.split(":");
  if (!helperId || !sig || rest.length > 0) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(helperId));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return helperId;
}

export async function setDemoHelperCookie(helperId: string): Promise<void> {
  const jar = await cookies();
  jar.set(HELPER_COOKIE, encodeHelperCookie(helperId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearDemoHelperCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(HELPER_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Null = nobody signed in (Supabase) / no demo helper cookie. */
export async function getHelperSession(): Promise<HelperSession | null> {
  if (authMode() === "supabase") {
    const supabase = await createClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const helper = await getStore().getHelperByUserId(user.id);
    return { mode: "supabase", userId: user.id, email: user.email ?? null, helper };
  }
  const jar = await cookies();
  const helperId = decodeHelperCookie(jar.get(HELPER_COOKIE)?.value);
  if (!helperId) return null;
  const helper = await getStore().getHelper(helperId);
  if (!helper) return null;
  return { mode: "demo", userId: null, email: helper.email, helper };
}
