# AGENTS.md – working in `nonnina-eu/website` (the one Nonnina repo)

Since 7 Nov 2026 this repo holds **everything**: the landing page (nonnina.eu, EN/DE/IT), the
product (senior screen, voice agent, emergency flow, family area, API) and the helpers
marketplace. One Next.js app, one Vercel project, one deploy. `nonnina-eu/app` is frozen:
do not push product work there any more, bring it here.

Specification: `docs/` – read `docs/README.md`, then your role file in `docs/agents/`.

## Where things live

| Path | What | Layout |
| --- | --- | --- |
| `app/[locale]/*` | Landing page, pitch deck, legal pages. EN at `/`, DE at `/de`, IT at `/it` | own root layout, `app/globals.css`, `tailwind.site.config.ts` |
| `app/(product)/*` | `/demo`, `/senior/[token]`, `/login`, `/app/*` (family), `/helpers/*` (marketplace), `/family/*` | own root layout, `app/(product)/globals.css`, `tailwind.config.ts` |
| `app/api/*` | API routes (emergency, help requests, ElevenLabs, Twilio, cron, helpers, waitlist) | – |
| `components/sections`, `components/pitch`, `components/brand.tsx` | Landing page | |
| `components/senior`, `components/family`, `components/marketplace`, `components/ui` | Product | |
| `lib/dictionaries` | Landing copy | |
| `lib/i18n/*` | Product copy (senior DE/IT, marketplace) | |
| `supabase/migrations` | Schema, one-to-one with `lib/db/types.ts` | |

The two Tailwind configs differ on purpose (radius scale): never import the landing CSS into
product pages or the other way round. `middleware.ts` routes product roots
(`app, auth, demo, family, helpers, login, senior`) without locale; everything else is landing.

## Commands

```bash
pnpm install
cp .env.example .env.local      # everything optional; empty = demo mode
pnpm dev                        # http://localhost:3000  (/, /demo, /helpers, /senior/maria-demo)
pnpm test                       # vitest – must stay green
pnpm typecheck && pnpm lint     # must stay clean before every push
```

## Non-negotiables

1. Emergency path never depends on the AI: red button + keyword net + agent tool. Do not remove or weaken any of the three.
2. Nonnina is **not an emergency service** and **never dials 112**; it runs the relative escalation ladder (`docs/02-…`). Keep the disclaimer on every page that mentions emergencies.
3. Rules in code with tests: escalation, keyword detection, ladder timing, benefit table.
4. `lib/db/types.ts` ⇄ SQL migration one-to-one; both store adapters implement every new `Store` method.
5. Service role only on the server. Never ship a key to the client.
6. Senior screen: ≥ 24 px text, ≥ 88 px targets, no menus, no scrolling, DE + IT in `lib/i18n/senior.ts`.
7. Graceful degradation: without env vars everything still runs in demo mode.
8. No voice recordings stored. Summaries only.
9. Copy: "orientation, not legal or medical advice". Numbers only from `docs/05-market-and-evidence.md` / `docs/07-pricing.md`. Seeded helper profiles are **demo profiles** and must stay labelled as such.

## How to work

- Small vertical slices: migration → types → store (both adapters) → API route → UI → test → check at `/demo`.
- Finish with `pnpm typecheck && pnpm lint && pnpm test`, then a conventional commit, small and often.
- Several agents work in parallel: use a git worktree per agent and never push someone else's half-done work.
