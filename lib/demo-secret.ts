import { timingSafeEqual } from "node:crypto";

/**
 * Demo endpoints are guarded by the `x-demo-secret` header when DEMO_SECRET is set.
 * Without DEMO_SECRET the behaviour is unchanged (open), so local demo mode keeps working.
 */
export function demoSecretOk(header: string | null): boolean {
  const secret = process.env.DEMO_SECRET;
  if (!secret) return true;
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
