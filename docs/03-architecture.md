# 03 · Architecture – how it is built

One Next.js app, one Supabase project, one ElevenLabs agent, Twilio for SMS/voice. Everything
else is glue. The marketing site is a separate repo (`nonnina-eu/website`) sharing the same
Supabase project (table `waitlist`).

```
 Senior tablet (/senior/[token])           Family phone (/app, login)
   big button · mic · captions                 realtime feed · I'm on it · setup wizard
   @elevenlabs/react  ◀── signed URL ──┐          │ Supabase Auth (magic link)
        │  WebSocket                   │          │ Supabase Realtime (anon key, RLS)
        ▼                              │          ▼
 ElevenLabs Agent "Lina" (DE/IT)   Next.js on Vercel (API routes, service role)
   client tools ─────────────────▶   /api/emergency · /api/help-request
   post-call webhook ────────────▶   /api/elevenlabs/webhook · /api/elevenlabs/signed-url
                                     /api/family/[id]/feed · /api/emergency/[id] (ack/cancel)
                                     /api/cron/escalate · /api/twilio/voice|gather
                                         │                 │
                                         ▼                 ▼
                                  Supabase Postgres (EU)   Twilio SMS + Voice (TTS, Gather)
                                  + Realtime publication   Resend email (optional)
```

## Stack (already in `package.json`)

Next.js 15 App Router · React 19 · TypeScript · Tailwind 3 · shadcn/ui-style primitives ·
framer-motion · `@supabase/ssr` + `supabase-js` · `@elevenlabs/react` · `twilio` · `resend` ·
`zod` · `vitest` · pnpm · Vercel.

## Repository layout

```
app/
  senior/[token]/        Layer 1 – senior screen (no login, device token in the URL)
  family/[familyId]/alerts  read-only realtime feed (prototype, link = secret)
  demo/                  Maria's tablet + Anna's phone side by side, reset button
  api/                   server routes (see table)
  (to build) app/        family area behind Supabase Auth: onboarding, seniors, relatives, feed
  (to build) login/, auth/callback/
components/senior/       talk-button, captions, emergency-overlay, mic-permission, clock
components/family/       alerts-feed
components/ui/           button, card, input, label, select, textarea, badge, accordion
hooks/                   use-emergency (client state machine), use-wake-lock
lib/db/                  store.ts (port) · supabase-store.ts · memory-store.ts · types.ts · seed.ts
lib/                     emergency-keywords · escalation · notify · elevenlabs · env · i18n · validation · rate-limit · time
supabase/                migrations/0001_init.sql · seed.sql
tests/                   vitest (keywords, escalation, webhook signature, time)
docs/                    this folder
```

## API routes

| Route | Method | Does |
| --- | --- | --- |
| `/api/elevenlabs/signed-url` | POST | Mints a signed URL for the agent (API key stays on the server); sends dynamic variables |
| `/api/elevenlabs/webhook` | POST | Verifies HMAC, stores `voice_sessions`, applies escalation rule, informs priority-1 relative |
| `/api/emergency` | POST | Creates event (dedupe 45 s), notifies relatives, logs `notified[]` |
| `/api/emergency/[id]` | PATCH | `acknowledge` (relative) / `cancel` (senior → all-clear) |
| `/api/help-request` | POST | Creates a help request from the agent tool, informs family |
| `/api/family/[familyId]/feed` | GET | Family feed (events, requests, sessions) |
| `/api/demo/reset` | POST | Clears demo events |
| `/api/cron/escalate` | GET | Runs the escalation ladder every minute (Vercel Cron, `Authorization: Bearer CRON_SECRET`); logic in `lib/escalation-runner.ts` |
| `/api/twilio/voice` + `/api/twilio/gather` | POST | TwiML for the relative call (Say + Gather), digit 1 → acknowledge; `X-Twilio-Signature` verified, 403 without Twilio |

## Data model (`lib/db/types.ts` ⇄ `supabase/migrations/0001_init.sql`)

```
families (id, name, email, [fallback_phone*], created_at)
 ├─ relatives (id, family_id, name, relation, phone E.164, email, notify_sms, notify_call, priority, [user_id*])
 └─ seniors (id, family_id, first_name, language de|it, city, address_note, care_level 0-5,
             device_token UNIQUE, medication_times jsonb, created_at)
      ├─ voice_sessions (conversation_id, summary, mood, problem_category, needs_human)
      ├─ help_requests (category, summary, status open|ai_solved|escalated|matched)
      └─ emergency_events (level, reason, quote, source, status, notified jsonb,
                           [escalation_step*, next_step_at*, acknowledged_by*], created_at, updated_at)
waitlist (email, role, city, message)            ← shared with the website repo
```
`*` = columns the MVP adds (migration `0002`). Keep `types.ts` and SQL one-to-one.

## Security model

- **Senior:** no login. The device token in the URL is the credential (random 24 hex). The
  family generates it as a QR code; scanning on the tablet opens `/senior/<token>`. Rotating
  the token = new QR.
- **Family:** Supabase Auth, magic link (no passwords to forget). `relatives.user_id` links the
  auth user to a relative; RLS: a user reads only rows of families they belong to. Until the
  login exists, the alerts page is link-protected (family id = secret) – prototype only.
- **Server routes** use the service role; the browser never writes except `waitlist`.
- **Webhook** verified with `ElevenLabs-Signature` HMAC. **Twilio** callbacks to be verified with `X-Twilio-Signature`.
- Rate limit per senior on `/api/emergency`, but a first emergency always passes.

## Demo mode

With no env vars the in-memory store is seeded with family Weber (Maria, Anna, Thomas),
notifications are written into the event as `channel: demo`, and the senior screen shows
"voice not configured". This keeps `/demo` working on any deploy. Note: in-memory state is
**per server instance** – for a deployed demo use Supabase.

## Environments

| | Where | Notes |
| --- | --- | --- |
| Production | https://care-copilot-silk.vercel.app (Vercel project `care-copilot`, team `ethernal3`) | `/` → `/demo`. No service keys yet → demo mode |
| Supabase | to create, **EU (Frankfurt)** | run `0001_init.sql`, `seed.sql` |
| ElevenLabs | agent "Lina", config in `elevenlabs-agent.md` | enable "Require authentication" |
| Twilio | DE or IT number with SMS + voice | relatives' numbers must be E.164 |

## Accessibility of the senior screen (keep it)

Base font ≥ 24 px, greeting ≥ 48 px, WCAG AAA contrast, touch targets ≥ 88 px, main button
≥ 260 px, no menus, no scrolling, no fast timeouts, captions of what Lina says, Screen Wake
Lock, `prefers-reduced-motion`, DE + IT.
