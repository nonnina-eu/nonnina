# Nonnina – website

Marketing site for **Nonnina** (nonnina.eu), the voice companion for older people at home.
English at `/`, German at `/de`, Italian at `/it`, with a waitlist.

The product (senior screen, emergency flow, family alerts) lives in
[`nonnina-eu/app`](https://github.com/nonnina-eu/app). Both share one Supabase project.

## Brand

The full brand identity (logo, colour, type, photography, voice, components) is in
[`public/brand/nonnina-brand-identity.html`](public/brand/nonnina-brand-identity.html), published at `/brand/nonnina-brand-identity.html` (linked in the footer).
Structural reference: grassfeld.com.

- Headlines: Bricolage Grotesque at 75% width, weight 800. Text: Manrope.
- Colours: Ink `#202128`, Latte `#FAF6F0`, Sole `#F4B740` (spark only), herb pastels for topics,
  Allarme `#B42318` for emergency only. Tokens live in `tailwind.config.ts`.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # everything optional
pnpm dev                     # http://localhost:3001
pnpm typecheck && pnpm lint && pnpm build
```

## How languages work

- `middleware.ts` serves English at `/` (rewritten to `/en`), redirects `/en/*` to the unprefixed URL,
  and on the home page sends first-time visitors to `/de` or `/it` based on `Accept-Language`.
  An explicit choice in the EN · DE · IT switcher is stored in the `nonnina-locale` cookie.
- All copy is in `lib/dictionaries/{en,de,it}.ts`. German addresses the reader with "Sie",
  Italian with "tu". The product voice "Lina" always uses Sie / Lei towards the senior.
- Each locale has canonical and hreflang alternates, and is listed in `sitemap.xml`.

## Environment variables

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saving sign-ups in the shared `waitlist` table. Without them sign-ups are kept in memory and logged on Vercel. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph (e.g. `https://nonnina.eu`). |
| `NEXT_PUBLIC_APP_URL` | "Live demo" link to the app. |

## Structure

```
app/[locale]/        layout (fonts, metadata), page, localized 404
app/api/waitlist/    sign-up endpoint (zod, rate limit, honeypot)
components/          brand (logo), header, language switcher, reveal animation
components/sections/ hero, features, how it works, feature blocks, safety, FAQ, waitlist, footer
lib/                 i18n, dictionaries, env, validation, waitlist store
public/photos/       photography
public/brand/        brand identity document and logo files
```

> Nonnina is not an emergency service and does not replace 112. Orientation only, not legal or medical advice.
