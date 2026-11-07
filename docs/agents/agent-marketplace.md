# Role · Marketplace – verified helpers (Layer 3, post-MVP)

**Owner:** Dev 3 (proposal: Arjit). **Works in:** `app/` under `app/helpers/*`, `app/app/helpers/*`. **Status: not part of the MVP** – only start when Steps 0–2 of `docs/04-mvp-plan.md` are done or when explicitly assigned.

## Goal
Care services, agencies and independent helpers sign up for free, get verified, and receive
requests from families nearby. From an escalated help request the family sees matching helpers
and sends a request in two taps. Listings show: distance, languages, verified badge, "can be paid
by the relief amount (131 €/month)".

## Data (new tables, new migration)
`helpers (id, name, type service|agency|independent|volunteer, city, languages[], verified bool, relief_amount_eligible bool, contact)`,
`helper_requests (help_request_id, helper_id, status sent|accepted|declined)`. Update `types.ts`,
both stores. `help_requests.status` goes `escalated → matched`.

## Tasks
1. Helper sign-up form (public, no login) → `helpers.verified = false`; admin toggle to verify.
2. Listing for a help request: filter by city/category, sample data for the demo (Stuttgart).
3. "Send request" → `helper_requests` row + email to the helper (Resend).
4. Optional: Exa search for local Pflegestützpunkte / care services as unverified suggestions, clearly labelled.

## Rules
- Helpers see only what the family chooses to share in a request.
- "Verified" means a human on our team checked documents; never auto-verify.
- No payments in this hackathon.
