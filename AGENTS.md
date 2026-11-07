# AGENTS.md – working in `nonnina-eu/website`

Marketing site and waitlist for **Nonnina** (nonnina.eu), IT / EN / DE. The product itself is
in the sibling repo `nonnina-eu/app` (local: `../app`); its specification is in `../app/docs/`
and the role file for this repo is `../app/docs/agents/agent-website.md`. If you only have
this repo, the essentials are below.

## What Nonnina is (one paragraph you can paraphrase)

A voice companion for older people living alone. The senior has a tablet with one big button
and simply talks – company, reminders, asking for help. The family gets a real-time alert
within seconds when something is wrong (SMS, call, live feed), and every need the senior
speaks becomes a request the family can act on. Germany first, Italy next. Free for the senior,
subscription for the family.

## Copy rules (legal and product)

- Nonnina is **not an emergency service** and **does not replace 112**. It alerts the family and shows a 112 button; it never dials 112 itself. Keep the disclaimer on the page.
- "Orientation, not legal or medical advice." No diagnoses, no promises of benefits.
- Numbers you may use are in `../app/docs/05-market-and-evidence.md` (e.g. 5.52 M people cared for at home in Germany, 2025). Do not invent statistics.
- Features you may claim are what the app does today: see `../app/docs/06-pitch-and-team.md` → "Demo facts the deck may claim".
- Tone: warm, calm, plain words. Address the adult child (40–60) who lives far from a parent 70+.

## Technical

```bash
pnpm install && pnpm dev     # http://localhost:3001
pnpm typecheck && pnpm lint && pnpm build
```
- Waitlist writes to the shared Supabase table `waitlist` (created by the app's migration). Without keys: in-memory.
- "Live demo" links point to `NEXT_PUBLIC_APP_URL` (`/demo`).
- Keep Lighthouse accessibility ≥ 95; the audience includes older relatives.
- Do not copy product code here; link to the app instead.
