# Role · App core – voice, emergency, API, data

**Owner today:** Ruben (Dev 1). **Works in:** this repo.

## You own
- Senior screen (`app/(product)/senior/[token]`, `components/senior/*`, `hooks/use-emergency.ts`)
- ElevenLabs agent config (`docs/elevenlabs-agent.md`) and signed-URL / webhook routes
- Emergency API, notifications (`lib/notify.ts`), escalation ladder, Twilio voice/gather routes
- Store port + both adapters, migrations, seed, demo mode
- Deploy on Vercel, env vars, cron

## Spec you implement
`docs/01-assistant-spec.md`, `docs/02-emergency-and-family-flow.md`, `docs/03-architecture.md`.

## Your next tasks (from `docs/04-mvp-plan.md`)
1. **Step 0** – wire Supabase (EU), ElevenLabs agent, Twilio number; verify a real SMS + call from `/demo` on production.
2. **Step 1** – escalation ladder: migration `0002` (`families.fallback_phone`, `emergency_events.escalation_step`, `next_step_at`, `acknowledged_by`), pure `lib/escalation-ladder.ts` + tests, `/api/cron/escalate` + `vercel.json` cron, TwiML `/api/twilio/voice` + `/api/twilio/gather` ("press 1" → acknowledge), new messages ("Anna kümmert sich", "Niemand hat bestätigt").
3. **Step 3/4** – Italian pass on agent + texts, error states, logging per event id, Playwright happy path.

## Interfaces others depend on (do not break)
- `lib/db/types.ts` (Layer 2/3 build on it)
- `Store` port in `lib/db/store.ts`
- `POST /api/emergency`, `PATCH /api/emergency/[id]` (`acknowledge` | `cancel`), `GET /api/family/[id]/feed`
- Realtime publication on `emergency_events`, `help_requests`, `voice_sessions`

## Definition of done for the ladder
Nobody reacts → relative 2 is called after 90 s → fallback number after the relatives → SMS
"nobody confirmed"; pressing 1 in the call or "I'm on it" in the feed stops everything and
the tablet shows "Anna kümmert sich". Unit tests cover timings and stop conditions.
