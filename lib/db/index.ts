import "server-only";
import { env } from "@/lib/env";
import { MemoryStore } from "./memory-store";
import { SupabaseStore } from "./supabase-store";
import type { Store } from "./store";

let memory: MemoryStore | null = null;

/**
 * Returns the storage adapter for this request.
 * Supabase when the service role key exists, otherwise the in-memory demo store.
 */
export function getStore(): Store {
  if (env.supabaseAdmin()) return new SupabaseStore();
  memory ??= new MemoryStore();
  return memory;
}

export type { Store } from "./store";
export * from "./types";
export { DEMO_HELPER_IDS, DEMO_IDS, DEMO_TOKEN, DEMO_TOKEN_IT } from "./seed";
