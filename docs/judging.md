# Judging map: criteria → evidence

The hackathon scores four criteria, 25 % each. This page points to the evidence for each one.
Live URLs: https://www.nonnina.eu runs with the real database (accounts via magic link);
https://nonnina-website.vercel.app is the same app in demo mode (one-click login as "Anna"), used
for the paths below.

## 1. Problem & Customer

| Question | Evidence |
| --- | --- |
| Who exactly has the problem? | Adult children 40–60 living away from a parent 70+ who lives alone. Persona "Dr. Julia, 48" and her grandmother (85, care level 1): `docs/validation.md` |
| How do they solve it today and why does that hurt? | Calls, WhatsApp, Google; no overview, no alert, help that goes unused: `README.md`, `docs/00-vision.md`, deck slide 1 |
| Did we talk to real people? | 26 Stuttgart care providers called on 7 Nov 2026, 4 reached and interviewed, 3h+ on the phone: `docs/validation.md` |
| What did we learn and change? | Table "What changed in Nonnina because of these conversations": help requests, verified helpers with family approval, relief-budget tracking, relief-amount badge: `docs/validation.md` |
| Landing page with sign-up | https://www.nonnina.eu (waitlist form, EN/DE/IT); API `app/api/waitlist`, never loses a sign-up (`tests/waitlist.test.ts`) |

## 2. Product

| Question | Evidence |
| --- | --- |
| Does it work? | Live: `/demo` (tablet + family side by side), `/senior/maria-demo`, `/login` → "Continue as Anna" → `/app`, `/helpers` |
| Is it complete? | Three connected sides: senior voice screen, family dashboard (alerts, ladder, summaries, relief budget), helpers marketplace (sign-up, verification, requests, job recording) |
| Is it stable? | 124 unit tests (`tests/`), typecheck + lint clean, ElevenLabs behaviour tests (`scripts/elevenlabs/run-tests.mjs`, 10/10), graceful degradation without keys |
| Is the AI used responsibly? | Tools return the real outcome to Lina (`lib/tool-outcomes.ts`); emergency path never depends on the AI alone (`lib/emergency-keywords.ts`, red button); never dials 112 (`docs/02-emergency-and-family-flow.md`) |
| Code quality | Store port with two adapters (`lib/db/`), migrations one-to-one with types, RLS, zod validation, atomic emergency claim (`supabase/migrations/0004_*`), idempotent webhook |

## 3. Business Potential

| Question | Evidence |
| --- | --- |
| Who pays and how much? | Families: 10–15 % of every completed job, a monthly subscription lowers the fee; senior free; €500k pre-seed ask: `docs/business-model.md` |
| How big is the market? | 5.52 M people cared for at home in Germany (2025), 80+ growing to 8.5–9.8 M by 2050, care-staff gap 280 000–690 000 by 2049: `docs/05-market-and-evidence.md` |
| Why now? | Voice AI for people who never learned apps; relief-amount rule change reported by a care service; DiPA framework opened to apps that relieve family carers (Jul 2026): `docs/business-model.md` |
| Why we beat alternatives | Comparison with Hausnotruf, care services, generic marketplaces, priced competitors: `docs/business-model.md`, `docs/07-pricing.md` |

## 4. Team & Pitch

| Question | Evidence |
| --- | --- |
| Deck | https://nonnina-website.vercel.app/pitch (5 slides, arrow keys, Cmd+P for PDF); source `components/pitch/slides.tsx` |
| Can the team execute? | Everything in this repo was built on 7 Nov 2026: see `git log` (merged history of the product and landing repos) |
| Roles | `docs/06-pitch-and-team.md` |
| Honesty | Claims the deck may and may not make: `docs/06-pitch-and-team.md`; open points listed in `docs/validation.md` → "What we still need to verify" |
