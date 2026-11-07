# Nonnina

**One button for Nonna. Peace of mind for the whole family.**

Nonnina is a voice companion for older people who live alone at home. The senior presses one
big button and talks to **Lina** in German or Italian. Every need Lina cannot solve becomes an
action for the family, an emergency reaches a relative in seconds, and verified local helpers
do the errands the family would do if they lived closer.

Built at the **Cursor x Sandbox Founders Hackathon**, Stuttgart, 7 Nov 2026.

| | |
| --- | --- |
| Live product with the real database (create an account via magic link) | https://www.nonnina.eu |
| Same app in demo mode (one-click login as "Anna", nothing persisted) | https://nonnina-website.vercel.app |
| Live demo, senior tablet and family view side by side | https://nonnina-website.vercel.app/demo |
| Pitch deck (5 slides, in the app) | https://nonnina-website.vercel.app/pitch |
| Brand identity | https://nonnina-website.vercel.app/brand/nonnina-brand-identity.html |

> Nonnina is not an emergency service and never dials 112 itself. Orientation only, no medical or legal advice.

## The problem

Adult children aged 40–60 live far from a parent aged 70+ who lives alone. They coordinate care
over phone calls, WhatsApp and Google while working full time. The parent cannot use apps. A fall
can go unnoticed for hours, everyday errands pile up, and the money the care insurance already
pays for help (the **relief amount, 131 € per month from care level 1**) often goes unused.

On the day we called **26 care providers** in Stuttgart, reached and interviewed **4**, and spent
**3h+** on the phone with them. They confirmed that small everyday
requests (the TV, a letter, the post, shopping) land on carers every day, that strangers are the
blocker for seniors, and that relatives end up organising everything. Full notes and what we
changed: [docs/validation.md](docs/validation.md).

## What we built

Three connected experiences in one Next.js app, all live:

1. **Senior** (`/senior`, `/senior/maria-demo`, `/senior/giulia-demo`)
   - One big button, no menus, no scrolling, large type, zoom allowed.
   - Lina, a voice agent on ElevenLabs, speaks German or Italian and always uses the formal Sie or Lei.
   - Lina's tools create real events: `trigger_emergency`, `create_help_request` and `get_next_reminder`.
   - Lina only tells the senior what really happened. The tools return `{ok, notified, mode, error}`.
   - An emergency is detected three independent ways: by Lina, by a keyword safety net, and by a red Help button that always works.
   - A senior opens their screen with a code from the family. The tablet then remembers it.
2. **Family** (`/login` and `/app`)
   - Magic-link login and onboarding: parent, relatives, alert order, and a QR code for the tablet.
   - Real-time alerts. An "I'm on it" button makes the tablet say "Anna kümmert sich".
   - Call summaries with mood, and help requests from the conversation.
   - **Relief budget:** how much of the 131 € is used this month, what is left, what the family pays extra, and the carry-over.
   - Escalation ladder: SMS to all relatives, then a call to each relative in order with "press 1 to confirm", every 90 s until someone answers.
3. **Helpers marketplace** (`/helpers`, `/helpers/join` and `/helpers/me`)
   - Helpers create a profile: services, languages, rate or free.
   - The team verifies profiles by hand.
   - Families send requests, and contact details are shared only after the helper accepts.
   - Finished jobs are recorded with date, hours and amount, and feed the relief budget.
   - Seeded profiles are clearly labelled **demo profiles**.

Plus the landing page in EN/DE/IT (`/`, `/de`, `/it`):
- four doors: senior, family, find a helper, become a helper;
- a side tab "Open Nonnina, for seniors";
- a waitlist;
- legal pages, including the Impressum.

## Business in one paragraph

**The Upwork for elderly care.** The senior never pays and never sees a marketplace. Families
compare, book and pay for every kind of help in one place. Nonnina takes **10–15 % of the order
value on every completed job**, and a monthly family subscription lowers that fee. Much of this
help can be paid from a budget families already have: the relief amount of **131 € per month**
from care level 1, for recognised services. Germany has **5.52 M** people cared for at home, 6 M
people aged 80+ today and up to **9.8 M by 2050**, and up to **690 000** carers missing by 2049.
We are raising a **€500k pre-seed** for twelve months: the five of us, the helper vetting process
and one dense city. Details: [docs/business-model.md](docs/business-model.md),
[docs/05-market-and-evidence.md](docs/05-market-and-evidence.md).

## For judges and reviewers

[docs/judging.md](docs/judging.md) maps each hackathon criterion to the evidence in this repo and
online: problem and customer, product, business potential, team and pitch.

## Architecture

```
Senior tablet ──voice──▶ ElevenLabs agent "Lina" ──client tools──▶ /api/emergency, /api/help-request
      │                                  └─post-call webhook──▶ /api/elevenlabs/webhook (summary, mood)
      │ poll /api/senior/[token]/status (also drives the escalation ladder)
      ▼
Supabase (EU) ◀── Next.js 15 server (store port: SupabaseStore | MemoryStore) ──▶ Twilio SMS + calls, Resend email
      ▲
Family dashboard /app ── realtime + polling ── helpers marketplace /helpers
```

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript, Tailwind |
| Voice | ElevenLabs Agents with signed URLs, client tools, a post-call webhook and dynamic variables. The LLM is set in `scripts/elevenlabs/` (default Gemini 2.5 Flash). |
| Data | Supabase Postgres in the EU, with RLS, magic-link auth and realtime. Migrations 0001–0007 live in `supabase/migrations`. |
| Messaging | Twilio SMS and voice ("press 1"), with Resend email as fallback |
| Hosting | Vercel |
| Tests | Vitest, 13 files, 124 tests: escalation ladder, keyword detection, tool outcomes, marketplace, relief budget, waitlist and more |

**Graceful degradation** is a rule. Without keys the whole app runs in demo mode, with in-memory
data and seeded families, helpers and jobs. Deeper write-up:
[docs/03-architecture.md](docs/03-architecture.md).

### Repository map

| Path | What |
| --- | --- |
| `app/[locale]/` | Landing page, pitch deck, legal pages (EN at `/`, DE `/de`, IT `/it`) |
| `app/(product)/` | Product: `demo`, `senior`, `login`, `app` (family), `helpers` (marketplace), `family` |
| `app/api/` | API routes: emergency, help requests, ElevenLabs signed URL + webhook, Twilio, cron, helpers, waitlist, demo |
| `components/` | `sections/` + `pitch/` (landing), `senior/`, `family/`, `marketplace/`, `demo/`, `ui/` |
| `lib/` | Domain logic: `escalation*.ts`, `emergency-keywords.ts`, `tool-outcomes.ts`, `relief-budget.ts`, `marketplace.ts`, `notify.ts`, `db/` (store port + adapters + seed), `i18n/`, `dictionaries/`, `legal/` |
| `supabase/` | Migrations, `seed.sql`, `setup-all.sql` (one paste to set up a project) |
| `scripts/` | ElevenLabs agent setup and behaviour tests, Supabase bundle, Vercel env helper |
| `tests/` | Vitest unit tests |
| `docs/` | Specification, validation, business, research, go-live guide |
| `public/` | Photos, helper portraits (demo), brand identity |

## Run it

```bash
pnpm install
cp .env.example .env.local     # everything optional: empty = demo mode
pnpm dev                       # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Try it locally:
- `/` is the landing page.
- `/demo` shows the tablet and the family view side by side.
- `/login` then "Continue as Anna" opens the family dashboard with the relief budget.
- `/helpers` is the marketplace.
- `/senior/maria-demo` is Lina in German.

To go live with real accounts, follow [docs/go-live.md](docs/go-live.md):
1. paste `supabase/setup-all.sql` into Supabase;
2. set the environment variables;
3. deploy.

## Safety principles

- The emergency path never depends on the AI alone. The red button and the keyword net always work.
- Nonnina never dials 112. It runs the relatives' escalation ladder and shows a 112 button.
- Lina gives no diagnoses, no medication doses and no legal advice. She says what she does not know.
- No voice recordings are stored, only short summaries. Data stays in the EU.
- Helpers are verified by a human. Contacts are shared only after the helper accepts.

## Documentation

| File | What |
| --- | --- |
| [docs/judging.md](docs/judging.md) | Criteria → evidence |
| [docs/validation.md](docs/validation.md) | Customer, interviews, what we changed |
| [docs/business-model.md](docs/business-model.md) | Who pays, market, why now, competition |
| [docs/00-vision.md](docs/00-vision.md) … [docs/07-pricing.md](docs/07-pricing.md) | Product specification |
| [docs/README.md](docs/README.md) | Full index |
| [AGENTS.md](AGENTS.md) | Rules for anyone (human or AI) changing this code |
| [llms.txt](llms.txt) | Short index for AI agents |

## Team

| Person | Role |
| --- | --- |
| Ruben Havrestiuc | CTO · Tech lead |
| Arjit Yadav | Backend & Voice AI |
| Megha Darda | QA & Reliability |
| Gloria Niiquaye | Market & sales validation |
| David Göz | Marketing & go-to-market |

Yes, we would take this full-time.

Licence: MIT ([LICENSE](LICENSE)).
