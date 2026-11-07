# Nonnina

Voice companion for older people at home, with real-time family alerts and a marketplace of
local helpers. Cursor x Sandbox Hackathon, Stuttgart, 7 Nov 2026.

This one Next.js app serves:

| URL | What |
| --- | --- |
| `/`, `/de`, `/it` | Landing page and waitlist (EN/DE/IT) |
| `/pitch` | 5-slide pitch deck |
| `/demo` | Live demo: senior tablet and family view side by side |
| `/senior/maria-demo`, `/senior/giulia-demo` | Senior screen with the voice agent Lina (DE / IT) |
| `/login`, `/app` | Family area: onboarding, dashboard, settings |
| `/helpers`, `/helpers/join`, `/helpers/me` | Helpers marketplace |
| `/brand/nonnina-brand-identity.html` | Brand identity |

## Run locally

```bash
pnpm install
cp .env.example .env.local   # everything optional: no keys = demo mode with in-memory data
pnpm dev                     # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Environment

See `.env.example`. Supabase (data + magic-link login), ElevenLabs (voice), Twilio (SMS + call),
Resend (email) are all optional. In production set `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_SITE_URL` to `https://www.nonnina.eu`.

## Docs

`docs/` holds the specification (vision, emergency flow, MVP plan, pricing, ElevenLabs agent)
and the role files for every agent and teammate. Start with `AGENTS.md`.

Nonnina is not an emergency service and never calls 112 by itself.
