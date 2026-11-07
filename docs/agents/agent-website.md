# Role · Website – landing page, waitlist, copy

**Owner today:** Arjit. **Works in:** this repo (`app/[locale]`, `components/sections`, `lib/dictionaries`). Full rules in `AGENTS.md`.

## Goal
A landing page at nonnina.eu (IT/EN/DE) that explains Nonnina to an adult child living far
from a parent, collects waitlist sign-ups (the number goes into pitch slide 4), and links to the
live demo.

## Messaging (keep consistent with the deck, `docs/06-pitch-and-team.md`)
- Headline family: *One button for your parent. Peace of mind for you.*
- Three steps: **Talk** (one big button) → **Connect** (AI understands, family is updated in real time) → **Act** (family gets guidance and, later, verified local helpers).
- Safety section: not an emergency service, does not replace 112, alerts the family and shows a 112 button.
- Proof: live demo link (`/demo` on the app), screenshots of the three screens, interview quotes once David delivers them.

## Allowed facts and numbers
`docs/05-market-and-evidence.md` and `docs/06-pitch-and-team.md` → "Demo facts the deck may claim". Nothing else.

## Technical
Waitlist → shared Supabase `waitlist` table (migration lives in `app`). `NEXT_PUBLIC_APP_URL` for demo links. Lighthouse a11y ≥ 95, DE/IT/EN switch, no product code copied from `app`.
