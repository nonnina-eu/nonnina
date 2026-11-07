"use server";

import { escalateDemo, resetDemo } from "@/lib/demo-ops";

/**
 * The /demo page runs the demo operations server-side, so DEMO_SECRET never reaches the browser.
 * External callers of /api/demo/* must send the x-demo-secret header instead.
 */
export async function resetDemoAction() {
  return resetDemo();
}

export async function escalateDemoAction() {
  const r = await escalateDemo();
  return r.ok ? { ok: true, action: r.processed[0]?.action ?? null } : { ok: false, action: null };
}
