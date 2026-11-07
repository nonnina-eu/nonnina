# Role · Marketplace – verified helpers (Layer 3, post-MVP)

**Owner:** Dev 3 (proposal: Arjit). **Works in:** `app/` under `app/helpers/*`, `app/app/helpers/*`. **Status: v1 built (assigned for the hackathon demo)** – see "Built" below.

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

## Built (v1, hackathon)

Code: `supabase/migrations/0005_marketplace.sql`, `lib/db/types.ts` (`Helper`, `HelperRequest`),
Store methods in both adapters, `lib/marketplace.ts` (public projection, filters, category →
service mapping), `lib/validation.ts` (helper profile / request / API query), `lib/helper-auth.ts`,
`lib/notify-marketplace.ts`, `lib/i18n/marketplace.ts` (EN/DE/IT, cookie `nonnina_lang`),
`app/helpers/*`, `components/marketplace/*`, `app/api/helpers`, tests in `tests/marketplace.test.ts`.

- [x] Data: `helpers` (kind independent|service|volunteer, services from a fixed list, `hourly_rate_eur` null = free, `verified`, `active`) and `helper_requests` (family, senior, helper, sending relative, optional help request, service, message, preferred time, status sent|accepted|declined|done, `notified[]`). RLS: public reads active helpers through column grants (no phone / email / user id) or the `helpers_public` view; writes service role only.
- [x] Public directory `/helpers` (service, city – default Stuttgart, language, verified only) and `/helpers/[id]`. Contact data never rendered.
- [x] Helper sign-up `/helpers/join`: Supabase magic link (same auth as the family area) or demo cookie `nonnina_helper`; zod-validated profile with two consents; new profiles are **unverified**. `/helpers/me`: edit profile, incoming requests, Accept / Decline / Done. Before accepting the helper sees only the senior's first name, city, service, message and time; Accept reveals the sending relative's name, phone and email.
- [x] Family: "Find help" in the nav, "Find a helper" on help-request cards (`/helpers?service=<mapped>&request=<id>`), "Send request" on the helper page, "Helpers" panel on `/app` with status; the helper's phone / email appear after Accept. Accept sets the linked help request to `matched`.
- [x] Notifications: SMS (Twilio) / email (Resend) to the helper on a new request and to the relative on accept / decline; demo mode records the text and shows it on screen.
- [x] `GET /api/helpers?service=&city=&language=&verified=` for the voice agent tools (safe fields only).
- [ ] Admin toggle for `verified` (today: set `helpers.verified = true` in the Supabase table editor).
- [ ] Distance, relief-amount eligibility flag, Exa suggestions, Lina tool `find_helper` (senior screen untouched on purpose).
