import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { WaitlistInput } from "./validation";

/**
 * Stores a sign-up in the shared Supabase `waitlist` table. Without Supabase keys, or when the
 * insert fails, the entry goes to the fallback: a structured server log line (kept in the Vercel
 * logs, so a sign-up is never lost) plus an in-memory map. Throws only if nothing could be saved.
 */
const g = globalThis as unknown as { __waitlistMemory?: Map<string, WaitlistInput> };

export type WaitlistResult = { created: boolean; storage: "supabase" | "fallback" };

function saveFallback(entry: WaitlistInput, reason: "no-database" | "insert-failed"): WaitlistResult {
  g.__waitlistMemory ??= new Map();
  if (g.__waitlistMemory.has(entry.email)) return { created: false, storage: "fallback" };
  // One JSON line per sign-up: easy to grep and re-import from the logs.
  console.info(
    "[waitlist] fallback signup",
    JSON.stringify({ reason, email: entry.email, role: entry.role, city: entry.city || null, message: entry.message || null, at: new Date().toISOString() }),
  );
  g.__waitlistMemory.set(entry.email, entry);
  return { created: true, storage: "fallback" };
}

export async function addToWaitlist(input: WaitlistInput): Promise<WaitlistResult> {
  const entry: WaitlistInput = { ...input, email: input.email.toLowerCase() };

  if (!env.supabaseAdmin()) return saveFallback(entry, "no-database");

  let failure: string;
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await db.from("waitlist").insert({
      email: entry.email,
      role: entry.role,
      city: entry.city || null,
      message: entry.message || null,
    });
    if (!error) return { created: true, storage: "supabase" };
    if (error.code === "23505") return { created: false, storage: "supabase" }; // unique_violation
    failure = error.message;
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }
  console.error(`[waitlist] supabase insert failed: ${failure}`);
  return saveFallback(entry, "insert-failed");
}
