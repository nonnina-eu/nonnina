"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_IDS } from "@/lib/db";
import { env } from "@/lib/env";
import { authMode, DEMO_NEW, setDemoMemberCookie } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(120);

function safeNext(value: unknown): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/app";
}

/** Supabase mode: send a magic link. */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = emailSchema.safeParse(formData.get("email"));
  const next = safeNext(formData.get("next"));
  if (!email.success) redirect(`/login?error=email&next=${encodeURIComponent(next)}`);
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=config");
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${env.appUrl()}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: true },
  });
  if (error) redirect(`/login?error=send&next=${encodeURIComponent(next)}`);
  redirect(`/login?sent=${encodeURIComponent(email.data)}`);
}

/** Demo mode: continue as Anna of the seeded family Weber. */
export async function continueAsDemoFamily(formData: FormData): Promise<void> {
  if (authMode() !== "demo") redirect("/login");
  await setDemoMemberCookie(DEMO_IDS.anna, DEMO_IDS.family);
  redirect(safeNext(formData.get("next")));
}

/** Demo mode: start the wizard with no family yet (the cookie is set in step 1). */
export async function startDemoSetup(): Promise<void> {
  if (authMode() !== "demo") redirect("/login");
  // A placeholder cookie lets the middleware through; getCurrentMember() treats it as "no family".
  await setDemoMemberCookie(DEMO_NEW, DEMO_NEW);
  redirect("/app/setup");
}
