# 04 · MVP plan – where we are, what we build, in which order

Date: 7 Nov 2026. Hackathon demo today; this plan goes beyond the demo to a **valid MVP**
that a first real family could use.

## Where we are (verified: `pnpm typecheck` clean, 39 unit tests green)

**Built and working in demo mode**

- Senior screen with voice (ElevenLabs), captions, reminders, red button, emergency mode, warning countdown, "I'm fine".
- Three emergency triggers (agent tool, keyword net DE/IT/EN, button), server dedupe, SMS to all relatives + call to priority-1 (Twilio), event log with `notified[]`.
- Realtime family alerts feed with "I'm on it", all-clear.
- Help requests from the agent and from the post-call webhook (escalation rule for legal/money/needs_human).
- Store port with Supabase + in-memory adapters, migration + seed, demo page, Vercel deploy.
- Landing + waitlist in the separate `website` repo.

**Missing for a valid MVP**

1. Real services wired: Supabase (EU), ElevenLabs agent, Twilio number. Today everything is demo mode.
2. Family login and onboarding (sign up → create senior → add relatives → QR code for the tablet).
3. Escalation ladder (priority-2…n, "press 1 to confirm", fallback number, "nobody confirmed").
4. Family area with the feed behind auth (replace link-as-secret).
5. Italian end-to-end check (agent in IT, texts, SMS).
6. A privacy/consent screen and the "not an emergency service" notice at onboarding.

## Decisions taken (do not reopen without a reason)

| Decision | Why |
| --- | --- |
| App does **not** dial 112 itself; it runs the relative ladder + fallback number, 112 button on the tablet | Carrier rules, liability, certification – see `02-emergency-and-family-flow.md` |
| Supabase Auth with **magic link** for the family, **no login for the senior** (QR → device token) | Already in the stack (`@supabase/ssr`), zero passwords, invite flow is one email |
| Family dashboard for the MVP = feed + setup only. Benefits table / traffic light = Layer 2, after | "Alone" is the problem the MVP proves; the other two need research that is not finished |
| No marketplace in the MVP | Layer 3 needs supply we do not have |
| Escalation timer = Vercel Cron (1 min) over `emergency_events.next_step_at` | Simplest thing that survives serverless |
| Web push later; SMS + call are the reliable channels now | Push needs service worker + VAPID + permission UX; not worth it before real users |

## What we reuse instead of building

| Need | Reuse | Notes |
| --- | --- | --- |
| Login, session cookies, middleware | **Supabase Auth** + `@supabase/ssr` (already a dependency). Copy the structure of the official `create-next-app -e with-supabase` template (`app/login`, `app/auth/callback`, `middleware.ts`, `utils/supabase/{client,server,middleware}.ts`) and switch the form to `signInWithOtp` (magic link) | https://vercel.com/templates/next.js/supabase-authentication · the PDF's starting point |
| Inviting other relatives | Supabase `auth.admin.inviteUserByEmail` or a magic link to an invite route that sets `relatives.user_id` | No extra library |
| Voice agent in the browser | **`@elevenlabs/react`** `useConversation` – already integrated; official reference example `elevenlabs/examples` → `agents/nextjs/quickstart` | https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js |
| SMS, voice call, "press 1" | **Twilio** SDK already integrated; TwiML `<Say>` + `<Gather numDigits="1">` for the ack | https://www.twilio.com/docs/voice |
| QR code for linking the tablet | npm `qrcode` (server render to SVG/PNG) | tiny, no service |
| UI primitives | shadcn/ui style components already in `components/ui` | add `dialog`, `switch`, `toast` as needed |
| Validation | `zod` schemas in `lib/validation.ts` | extend for onboarding forms |
| Forms | plain server actions + zod; no form library | keep it small |
| Web push (post-MVP) | npm `web-push` + service worker | later |

Checked and **not** worth forking: the open-source elder-care projects found (ZindagiGo,
SAHARA, CareAgent, EchoCare) are hackathon prototypes, Flutter/Flask, no licence or
maintenance guarantees, and none has our voice + family loop. Our own Layer 1 is already
further along.

## Build order

Each step ends in something demoable. Owner column is a proposal.

### Step 0 · Wire the real services (½ day, Ruben)
- Create Supabase project (EU Frankfurt), run `0001_init.sql` + `seed.sql` with real E.164 numbers, set env in Vercel.
- Create the ElevenLabs agent from `elevenlabs-agent.md` (DE first, IT second), enable auth, set webhook → `/api/elevenlabs/webhook`, copy secret.
- Buy one Twilio number (DE), verify SMS + voice to a real phone.
- **Done when:** on production, Maria's demo tablet triggers a real SMS and a real call.

### Step 1 · Escalation ladder (½ day)
- Migration `0002`: `families.fallback_phone`, `emergency_events.escalation_step int default 0`, `next_step_at timestamptz`, `acknowledged_by uuid`.
- `lib/escalation-ladder.ts`: pure function `nextStep(event, relatives, now) → { action, next_step_at }` with unit tests.
- `app/api/cron/escalate/route.ts` + `vercel.json` cron `* * * * *`; protect with `CRON_SECRET`.
- Twilio voice: `/api/twilio/voice` returns TwiML `<Say language="de-DE">…</Say><Gather numDigits="1" action="/api/twilio/gather">`; `/api/twilio/gather` with digit `1` → acknowledge event; verify `X-Twilio-Signature`.
- New messages: "Anna kümmert sich" to the others, "Niemand hat bestätigt".
- **Done when:** nobody presses anything → second relative is called after 90 s, fallback after all; pressing 1 stops it and the tablet shows "Anna kümmert sich".

### Step 2 · Family login + onboarding (1 day)
- Supabase Auth (magic link) following the `with-supabase` template structure; `middleware.ts` protects `/app/*`.
- Migration `0003`: `relatives.user_id uuid references auth.users`, RLS policies "user sees rows of families where they are a relative"; drop the anon read policies on events/requests/sessions once `/app` works.
- Onboarding wizard at `/app/setup`: (1) your name + phone → creates `families` + first `relatives` (priority 1), (2) senior: first name, language, city, care level, medication times, (3) other relatives: name, phone, relation, priority, (4) fallback number (optional, explained), (5) consent + "not an emergency service" notice, (6) **QR code** of `/senior/<device_token>` + "open this on the tablet".
- `/app` = the existing alerts feed, filtered by the user's family; `/family/[id]/alerts` stays only for `/demo`.
- Invite relatives by email (magic link lands on `/app/join?relative=<id>` → sets `user_id`).
- **Done when:** a stranger can sign up on production, link a tablet, and receive an SMS from it in under 5 minutes.

### Step 3 · Italian pass + polish (½ day)
- Agent IT first message/prompt verified by a native speaker; keyword list IT reviewed; SMS/voice texts IT; `tel:112` works on the tablet in both countries.
- Error states: mic denied, voice unavailable, offline button, Twilio failure → "call 112" banner.
- Lighthouse a11y ≥ 95 on senior screen and `/app`.

### Step 4 · Observability + safety nets (½ day)
- Vercel logs → log every emergency step with event id; Sentry (free tier) on client and server.
- Daily cron: events stuck in `open` for > 10 min → email to the team.
- Unit tests: ladder, Twilio signature, onboarding validation. One Playwright happy path: button → event → ack.

### Later (Layer 2 and 3, not MVP)
- Benefits rule table + traffic light + "you are missing X €/month" (data already in the PDF, Part 5).
- Proactive reminders spoken by the tablet; no-response check.
- Web push; native wrapper (Capacitor) if the tablet browser is a problem.
- ~~Marketplace of verified helpers~~ – v1 built (`/helpers`, see `docs/agents/agent-marketplace.md`); open: admin verify toggle, distance, Exa search for local care counselling.
- Certified Hausnotruf/teleassistenza partner for real 112 dispatch.

## Demo script (today)

1. Open `/demo`: Maria's tablet left, Anna's phone right.
2. Say „Ich bin gestürzt und komme nicht hoch" (or press the red button).
3. Tablet → emergency mode, 112 button; Anna's feed shows the alert in < 3 s; (with Twilio) Anna's phone rings.
4. Anna presses **I'm on it** → tablet: „Anna kümmert sich."
5. Maria presses **Mir geht es gut** → Anna gets the all-clear.
6. Say „Ich schaffe den Einkauf nicht mehr" → help request appears, category daily_help.
7. Reset demo data.

### Marketplace add-on (Layer 3)

1. Helper: `/helpers/join` → fill in the profile (or "Continue as Lucia") → `/helpers/me` shows "not yet verified".
2. Family: `/app` → help request "Ich schaffe den Einkauf nicht mehr" → **Find a helper** → `/helpers?service=shopping&request=…`.
3. Open a helper → **Send request** → confirmation shows the (demo) SMS to the helper.
4. Helper `/helpers/me` → **Accept** → Anna's name, phone and email appear.
5. Family `/app` → Helpers panel: **Accepted** + helper phone; the help request shows `matched`.

## Open questions for the team

- Which Twilio country number first: DE (+49) or IT (+39)? Affects SMS delivery and voice language default.
- Fallback number in the demo family: a teammate's phone.
- Do we show the escalation ladder to the senior ("Thomas wird jetzt angerufen") or keep the screen minimal? Proposal: minimal, one line.
- Consent wording for the senior (spoken by Lina at first use?) – needs the research teammate.

## Working method with AI agents (added 7 Nov, 12:10)

- Every agent reads `../AGENTS.md` (workspace map) → `AGENTS.md` of its repo → its role file in `docs/agents/`.
- One role per agent, one repo per role. Shared interfaces (`types.ts`, `Store`, API routes) change only through the app-core role, announced in the team chat.
- Optional code-navigation help: **Graphify** (`tools/graphify`, Apache-2.0). Install once per machine, then in this folder:
  ```bash
  uv tool install graphifyy          # or: pipx install graphifyy
  graphify install --project         # registers the /graphify skill for Claude Code / Cursor
  /graphify .                        # builds graphify-out/ (graph.html, GRAPH_REPORT.md, graph.json)
  graphify query "where is the emergency dedupe window?"
  ```
  Code parsing is local (tree-sitter); the docs pass uses the assistant's model. Add `graphify-out/` to `.gitignore` if the graph is large; the report can be committed.
- Research insight to keep in mind while building (from `05-market-and-evidence.md`): value = shorter distance between signal and intervention; fewer, better alerts; measure time-to-acknowledge and false alarms from day one.
