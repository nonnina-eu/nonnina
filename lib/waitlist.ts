import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { WaitlistInput } from "./validation";

/**
 * Stores a sign-up in the shared Supabase `waitlist` table (created by the app repo's
 * migration). Without Supabase keys it keeps entries in memory so the form still works.
 */
const g = globalThis as unknown as { __waitlistMemory?: Map<string, WaitlistInput> };

export async function addToWaitlist(input: WaitlistInput): Promise<{ created: boolean }> {
  const email = input.email.toLowerCase();

  if (!env.supabaseAdmin()) {
    g.__waitlistMemory ??= new Map();
    if (g.__waitlistMemory.has(email)) return { created: false };
    g.__waitlistMemory.set(email, { ...input, email });
    // No database configured: keep a trace in the server logs so a sign-up is never silently lost.
    if (process.env.VERCEL) console.info("[waitlist] signup (no database configured)", JSON.stringify({ email, role: input.role, city: input.city }));
    return { created: true };
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.from("waitlist").insert({
    email,
    role: input.role,
    city: input.city || null,
    message: input.message || null,
  });
  if (error) {
    if (error.code === "23505") return { created: false }; // unique_violation
    throw new Error(`[supabase] waitlist.insert: ${error.message}`);
  }
  return { created: true };
}
