# Role · Family layer – login, onboarding, dashboard

**Owner today:** Dev 2 (proposal: Gloria). **Works in:** this repo under `app/(product)/app/*`, `app/(product)/login`, `app/(product)/auth`, `components/family/*`.

## Goal
A family member signs up, creates the senior, adds relatives, links the tablet with a QR code,
and then sees the live feed behind login. Later (Layer 2): care-level wizard, benefits table,
legal traffic light, "you are missing X €/month", step-by-step plan.

## Spec
`docs/00-vision.md` (scope), `docs/02-emergency-and-family-flow.md` ("What relatives see"),
`docs/03-architecture.md` (security model, data model), `docs/04-mvp-plan.md` Step 2.

## MVP tasks (Step 2)
1. Supabase Auth, **magic link** (`signInWithOtp`), following the structure of the official `create-next-app -e with-supabase` template: `middleware.ts`, `lib/supabase/{client,server,middleware}.ts` (client/server already exist), `app/(product)/login`, `app/auth/callback`.
2. Migration `0003`: `relatives.user_id uuid references auth.users`, RLS "a user reads rows of families where they are a relative" on all family tables; remove the anon read policies once `/app` works (keep them until then for `/demo`).
3. Onboarding wizard `/app/setup` (server actions + zod): your name/phone → senior (first name, language, city, care level, medication times) → other relatives (name, phone E.164, relation, priority, notify_sms/notify_call) → fallback number (optional, explained) → consent + "not an emergency service" → **QR code** of `/senior/<device_token>` (npm `qrcode`), with "open this on the tablet, then bookmark it".
4. `/app` = existing `components/family/alerts-feed.tsx` filtered by the user's family, with "I'm on it", "mark help request done", "call Maria" (`tel:`).
5. Invite relatives by email → magic link → `/app/join?relative=<id>` sets `user_id`.
6. Settings page: edit relatives, medication times, rotate device token (new QR).

## Layer 2 (after MVP)
Benefits rule table as code (`lib/benefits.ts`, amounts from PDF Part 5 with sources, unit-tested), traffic-light rules, "steps" list, LLM only for plain-language explanation and application drafts (never for amounts). Every screen: "orientation, not legal advice".

## Do not
- Put the service-role key in client code. Server actions / route handlers only.
- Change `types.ts` without a migration and a memory-store update.
- Add passwords for the senior. The senior never logs in.
