function has(...keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k] && process.env[k]!.trim().length > 0));
}

export const env = {
  supabase: () => has("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
  /** Public URL of the Nonnina app (senior screen, family alerts, demo). */
  appUrl: (): string => (process.env.NEXT_PUBLIC_APP_URL ?? "https://care-copilot-silk.vercel.app").replace(/\/$/, ""),
  siteUrl: (): string =>
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001"),
};
