# Go live on www.nonnina.eu

Everything runs from this repo. Without keys the site works in demo mode (data in memory, no
voice). For real accounts, families and seniors you need the five steps below, once.

## 1. Database (Supabase, EU region)

1. Supabase → SQL editor → paste `supabase/setup-all.sql` → Run.
   It creates every table (migrations 0001 onwards) and loads the demo data (Weber family,
   Maria and Giulia, the demo helper profiles). It is safe on an empty project and on a
   project that already has the `waitlist` table. Regenerate it after a new migration:
   `pnpm db:bundle`.
2. Supabase → Authentication → URL configuration:
   - Site URL: `https://www.nonnina.eu`
   - Redirect URLs: `https://www.nonnina.eu/auth/callback`, `https://nonnina-website.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
3. Copy from Supabase → Project settings → API: URL, anon key, service role key.

## 2. Environment on Vercel

Put the values in `.env.production.local` (never commit it), then run from the repo root:

```bash
bash scripts/setup-vercel-env.sh
```

It sets `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` to https://www.nonnina.eu, generates
`AUTH_SECRET` and `CRON_SECRET`, and copies Supabase, ElevenLabs, Twilio and Resend keys.
Run it in the folder linked to the Vercel project that owns the nonnina.eu domain.

## 3. Deploy

Push to `main` (Git integration) or `vercel deploy --prod`.

## 4. ElevenLabs post-call summaries

ElevenLabs → Agents → Settings → Post-call webhook → URL
`https://www.nonnina.eu/api/elevenlabs/webhook`; put its secret in `ELEVENLABS_WEBHOOK_SECRET`
and rerun step 2. Voice and the emergency tools already work without this step.

## 5. Smoke test

| Who | Where | What to check |
| --- | --- | --- |
| Family | `/login` → magic link → `/app/setup` | create family, parent, relatives; QR / code for the tablet; relief budget card |
| Senior | `/senior` → code from the family settings | big button, Lina answers, red Help button → relatives get the alert |
| Helper | `/helpers/join` | create profile; it stays "not verified" until the team sets `verified = true` in the table editor |
| Family | `/helpers` → profile → request | helper sees it in `/helpers/me`, accepts, marks it done with hours |

Nonnina is not an emergency service and never dials 112. Demo profiles stay labelled as demo.
