#!/usr/bin/env bash
# Copies the production environment to the Vercel project linked in this folder (.vercel/project.json).
# Run it yourself from the repo root:   bash scripts/setup-vercel-env.sh [path/to/env-file]
# Reads values from the env file (default .env.production.local, then .env.local).
# AUTH_SECRET and CRON_SECRET are generated if missing. Existing values are overwritten (--force).
set -euo pipefail

FILE="${1:-}"
if [ -z "$FILE" ]; then
  if [ -f .env.production.local ]; then FILE=.env.production.local; else FILE=.env.local; fi
fi
[ -f "$FILE" ] || { echo "No env file found ($FILE)."; exit 1; }
command -v vercel >/dev/null || { echo "Install the Vercel CLI first: npm i -g vercel"; exit 1; }
[ -f .vercel/project.json ] || { echo "Link the project first: vercel link"; exit 1; }

get() { grep -E "^$1=" "$FILE" | tail -1 | cut -d= -f2- || true; }

PUBLIC_URL="${PUBLIC_URL:-https://www.nonnina.eu}"
AUTH="$(get AUTH_SECRET)"; [ -n "$AUTH" ] || AUTH="$(openssl rand -hex 32)"
CRON="$(get CRON_SECRET)"; [ -n "$CRON" ] || CRON="$(openssl rand -hex 32)"

echo "Project: $(cat .vercel/project.json)"
put() {
  [ -n "$2" ] || { echo "skip $1 (empty)"; return; }
  printf '%s' "$2" | vercel env add "$1" production --force >/dev/null 2>&1 && echo "set  $1" || echo "FAILED $1"
}
put NEXT_PUBLIC_APP_URL "$PUBLIC_URL"
put NEXT_PUBLIC_SITE_URL "$PUBLIC_URL"
put AUTH_SECRET "$AUTH"
put CRON_SECRET "$CRON"
for k in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
         ELEVENLABS_API_KEY ELEVENLABS_AGENT_ID ELEVENLABS_WEBHOOK_SECRET \
         TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_FROM_NUMBER RESEND_API_KEY RESEND_FROM_EMAIL; do
  put "$k" "$(get "$k")"
done
echo "Done. Redeploy to apply: vercel deploy --prod"
