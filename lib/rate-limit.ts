/**
 * Tiny in-memory sliding-window limiter. Per-instance only (fine for a prototype);
 * swap for Upstash/Redis if the product grows. Callers must make sure a first
 * emergency is never blocked (see /api/emergency).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, remaining: 0 };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, remaining: limit - hits.length };
}
