# Nonnina – website

Marketing site for **Nonnina** (nonnina.eu): the voice companion for older people living at home.
Landing page in Italian / English / German with a waitlist form.

The product itself (senior screen, emergency flow, family alerts) lives in
[`nonnina-eu/app`](https://github.com/nonnina-eu/app). Both share one Supabase project.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # all variables optional
pnpm dev                     # http://localhost:3001
pnpm typecheck && pnpm lint && pnpm build
```

## Environment variables

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saving sign-ups in the shared `waitlist` table. Without them: in-memory (demo). |
| `NEXT_PUBLIC_APP_URL` | "Live demo" links to the app. |
| `NEXT_PUBLIC_SITE_URL` | robots.txt / sitemap. |

## Structure

```
app/                 layout, landing route, api/waitlist, robots, sitemap
components/landing/  landing sections (hero, features, together, ask, safety, moments, quote band, FAQ, waitlist, footer)
components/ui/       button, input, select, textarea, label, accordion, badge, card
lib/                 env, validation (zod), waitlist store, rate limit, i18n dictionaries
public/photos/       photography used on the page
```

## Deploy

Vercel, framework Next.js, root of this repo. Add the env variables above.

> Nonnina is not an emergency service and does not replace 112. Orientation only, not legal or medical advice.
