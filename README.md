# Nonnina – app

**One button for your parent. One clear plan for you.**

This repository is the product: the senior screen, the emergency flow, the family alerts and the
API. The marketing site and waitlist live in [`nonnina-eu/website`](https://github.com/nonnina-eu/website).
Both share one Supabase project (the `waitlist` table is created by the migration here).

Nonnina is a voice companion for older people living at home (Germany first, Italy next).
The senior gets one big button to talk to a calm voice assistant. The family gets an alert
within seconds when something is wrong, and a plan for everything else.

> ⚠️ **Hackathon prototype.** Built in one day at the Cursor x Sandbox Hackathon Stuttgart 2026.
> Nonnina is **not** a certified emergency system, **not** an emergency service and does
> **not** replace 112. It never dials emergency services by itself. It gives orientation, not
> legal or medical advice.

## What is in this repo

| Route | What it is |
| --- | --- |
| `/` | Redirects to `/demo` (the landing page is in the website repo) |
| `/senior/[token]` | **Layer 1** – the senior screen: one button, voice conversation, emergency mode |
| `/family/[familyId]/alerts` | Minimal read-only, realtime list of alerts, help requests and call summaries |
| `/demo` | Maria's tablet and Anna's phone side by side, with a "reset demo data" button |
| `/api/*` | Server routes (emergency, help requests, ElevenLabs signed URL + webhook, family feed, demo reset) |

Demo URLs once deployed: `/demo`, `/senior/maria-demo`, `/family/11111111-1111-4111-8111-111111111111/alerts`.

### The emergency feature (Layer 1)

Three independent triggers, so it works even if the AI fails:

1. **AI tool** – the ElevenLabs agent calls `trigger_emergency(level, reason, quote)`.
2. **Keyword safety net** – every user transcript is checked in code against DE / IT / EN phrases
   (`lib/emergency-keywords.ts`, accent- and case-insensitive, unit-tested).
3. **Red "Hilfe" button** – always works, even with the voice session off or the network down.

Two levels:

- `emergency` (fall and cannot get up, chest pain, cannot breathe, …): full-screen emergency mode,
  relatives notified immediately (SMS to everyone, voice call to the priority-1 relative when
  Twilio voice is configured), **"112 anrufen"** one tap away.
- `warning` (dizzy, confused, missed medication, …): calm banner, 15-second visible countdown the
  senior can cancel, then a "please check in soon" SMS.

Every event is logged in `emergency_events` with its source and who was notified. If
notification fails, the screen says "Bitte rufen Sie 112 an" and retries in the background.
Cancelling ("Mir geht es gut") after a notification sends an all-clear follow-up.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style primitives · framer-motion ·
Supabase (Postgres, EU) via `@supabase/ssr` · ElevenLabs Agents (`@elevenlabs/react`) ·
Twilio (SMS/voice) · Resend (email) · zod · vitest · Vercel.

**Every integration degrades gracefully.** With no keys at all the app runs in *demo mode*:
an in-memory store seeded with Maria, Anna and Thomas, notifications written to the event
(and shown on the alerts page), and a friendly "voice not configured" state on the senior screen.

## Running locally

```bash
pnpm install
cp .env.example .env.local   # fill in what you have, everything is optional
pnpm dev                     # http://localhost:3000
pnpm test                    # unit tests (keyword detector, escalation rule, reminders, webhook signature)
pnpm typecheck && pnpm lint
```

### Environment variables

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Persistent storage + realtime. Without them: in-memory demo store (resets on cold start, **per server instance** – use Supabase for a deployed demo). |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` | Real voice conversation. Without them: the senior screen shows that the voice is unavailable; the help button still works. |
| `ELEVENLABS_WEBHOOK_SECRET` | Verifies the post-call webhook. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Real SMS (and a voice call to the priority-1 relative on emergencies). Without them: demo mode. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional email to relatives who have an email address. |
| `NEXT_PUBLIC_APP_URL` | Public URL used in SMS links. |
| `SEED_RELATIVE_ANNA_PHONE`, `SEED_RELATIVE_THOMAS_PHONE` | Optional real numbers for the demo relatives (in-memory mode). |

### Supabase setup

1. Create a project in the **EU (Frankfurt)** region.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (tables, enums, RLS, realtime publication).
3. Run `supabase/seed.sql` (family Weber, Maria, Anna, Thomas). Replace the placeholder phone
   numbers with real E.164 numbers before a live demo.
4. Copy the project URL, anon key and service-role key into your env.

The browser only ever inserts into `waitlist` and reads alert tables through the anon key for
realtime; all writes go through server routes using the service role. The family alerts page is
link-protected for the prototype (the family id is the secret); Layer 2 will add auth.

### ElevenLabs agent

See [`docs/elevenlabs-agent.md`](docs/elevenlabs-agent.md) for the exact first message, system
prompt, client tools, data-collection fields and webhook settings. Enable "Require authentication"
on the agent: the app only uses signed URLs minted on the server.

## Deploying on Vercel

```bash
vercel link
vercel env add ...   # or paste the variables in the dashboard
vercel --prod
```

Set `NEXT_PUBLIC_APP_URL` to the production URL so SMS links point to the right alerts page, and
point the ElevenLabs post-call webhook at `https://<app>/api/elevenlabs/webhook`.

## Recording the demo

Open `/demo`. Left: Maria's tablet. Right: Anna's phone (live). Say
*„Ich bin gestürzt und komme nicht hoch“* (or press the red button). Within seconds the tablet
switches to emergency mode and Anna's feed shows the alert. Press **"I'm on it"** on Anna's side:
Maria's screen shows *„Anna kümmert sich.“* Press **"Mir geht es gut"**: the family gets the all-clear.
"Reset demo data" clears the events.

## Project structure

```
app/                  routes (senior, family alerts, demo, api/*)
components/senior/    senior screen (talk button, captions, emergency overlay, …)
components/family/    realtime alerts feed
hooks/                useEmergency (client state machine), useWakeLock
lib/db/               Store port + Supabase and in-memory adapters, shared types, demo seed
lib/                  emergency-keywords, escalation, notify (Twilio / Resend / demo), elevenlabs, i18n, validation
supabase/             migration + seed
tests/                vitest unit tests
docs/                 ElevenLabs agent configuration
```

## Data model (for Layer 2 and Layer 3)

`families` → `relatives`, `seniors` → `voice_sessions`, `help_requests`, `emergency_events`;
plus `waitlist`. Types live in `lib/db/types.ts` and mirror the SQL one to one. The family
dashboard (Layer 2) and the helper marketplace (Layer 3) can build on `help_requests.status`
(`open → escalated → matched`) and `emergency_events`.

## Accessibility of the senior screen

Base font ≥ 24 px on a tablet, greeting ≥ 48 px, WCAG AAA contrast, touch targets ≥ 88 px,
main button ≥ 260 px, no menus, no scrolling, no timeouts that need fast reactions, large captions
of what the assistant says, Screen Wake Lock, `prefers-reduced-motion` respected, German and Italian.

## License

MIT – see [LICENSE](LICENSE).
