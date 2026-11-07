# AGENTS.md – working in `nonnina-eu/app`

Product repo of **Nonnina**: senior screen, voice agent, emergency flow, family alerts, API.
Specification lives in `docs/` – read `docs/README.md` first, then your role file in
`docs/agents/`. The workspace map (other repos, source documents) is `../AGENTS.md`.

## Commands

```bash
pnpm install
cp .env.example .env.local      # everything optional; empty = demo mode
pnpm dev                        # http://localhost:3000  (/demo, /senior/maria-demo)
pnpm test                       # vitest unit tests – must stay green
pnpm typecheck && pnpm lint     # must stay clean before every push
```

## Non-negotiables

1. Emergency path never depends on the AI: red button + keyword net + agent tool. Do not remove or weaken any of the three.
2. The app does not dial 112; it runs the relative escalation ladder (`docs/02-…`). Do not add auto-dial.
3. Rules in code with tests: escalation, keyword detection, ladder timing, benefit table.
4. `lib/db/types.ts` ⇄ SQL migration one-to-one; both store adapters (`supabase-store.ts`, `memory-store.ts`) implement every new `Store` method.
5. Service role only on the server. Browser gets anon key + RLS. Never ship a key to the client.
6. Senior screen: ≥ 24 px text, ≥ 88 px targets, no menus, no scrolling, DE + IT in `lib/i18n/senior.ts`.
7. Graceful degradation: without env vars everything still runs in demo mode.
8. No voice recordings stored. Summaries only.

## How to work (method)

- Pick the next unchecked item in `docs/04-mvp-plan.md` build order. Do not start Layer 2/3 work before Step 0–2 are done unless assigned.
- Before touching a flow, read the matching spec section and the tests in `tests/`. Write or extend the test first for pure logic (`lib/*`).
- Small vertical slices: migration → types → store (both adapters) → API route → UI → test → demo check at `/demo`.
- Finish with `pnpm typecheck && pnpm lint && pnpm test`, then a conventional commit (`feat:`, `fix:`, `chore:`), then update the status table in `docs/02-…` or the checklist in `docs/04-…` if a gap closed.
- When the spec and the code disagree: fix one, say which, never leave both.
- Optional: if Graphify is installed (`graphify install --project` in this folder), use `graphify query "<question>"` to find code instead of grepping.
