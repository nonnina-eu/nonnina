/**
 * Central, side-effect-free view of which optional services are configured.
 * Every integration must degrade gracefully when its keys are missing.
 */
function has(...keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k] && process.env[k]!.trim().length > 0));
}

export const env = {
  supabase: () => has("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseAdmin: () => has("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
  elevenlabs: () => has("ELEVENLABS_API_KEY", "ELEVENLABS_AGENT_ID"),
  twilio: () => has("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"),
  resend: () => has("RESEND_API_KEY"),
  appUrl: (): string =>
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
};

export type ServiceStatus = {
  database: "supabase" | "memory";
  voice: boolean;
  sms: boolean;
  email: boolean;
};

export function serviceStatus(): ServiceStatus {
  return {
    database: env.supabaseAdmin() ? "supabase" : "memory",
    voice: env.elevenlabs(),
    sms: env.twilio(),
    email: env.resend(),
  };
}
