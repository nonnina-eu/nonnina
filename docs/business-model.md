# Business model: who pays, how much, why now

Short version for judges and reviewers. Details and sources: `docs/07-pricing.md` (pricing
reasoning), `docs/05-market-and-evidence.md` (market numbers), `docs/research/` (full reports).
Our own prices are hypotheses for the Stuttgart pilot, not published tariffs.

## Who pays

| Who | Pays | What they get |
| --- | --- | --- |
| Senior (70+, lives alone) | **Nothing**, never sees a price | One button, the voice companion Lina (DE/IT), emergency alerts |
| Family (adult children 40–60) | **€19/month per senior**, all relatives included; €29/month on 24 months with a pre-configured tablet | Real-time alerts, escalation ladder, call summaries, help requests, relief-amount budget, helper marketplace |
| Helpers and care/support services | Free to join in the pilot; later a provider subscription for request management | Requests from families nearby, verified badge, relief-amount badge |

The Stuttgart pilot is free for families.

## Why these prices

- Nonnina is software plus a tablet with **no 24/7 call centre**: the family is the responder.
  That places it between app-only care software (~€10–20/month) and family-response emergency
  systems (easierLife HOME Family €19.95/month).
- It stays clearly **below** call-centre Hausnotruf (€27–45/month), which has staffed response we
  do not offer and do not claim.
- Families already have money for exactly the services in our marketplace: the **relief amount
  (Entlastungsbetrag) of 131 € per month from care level 1**, reimbursed for recognised services.
  Nonnina shows how much of it is used, so it stops going unused.

## Market

- Germany, 2025: **6.43 M** people receive care-insurance benefits, **5.52 M** of them are cared
  for at home (Destatis via `docs/05`).
- People aged 80+: ~6 M today, **8.5–9.8 M in 2050**.
- Professional care staff gap by 2049: **280 000 to 690 000** people. Families will carry more.
- Our first segment: adult children in Stuttgart with a parent 70+ living alone. Then Germany,
  then Italy (Lina already speaks Italian).

## Why now

- **Voice AI finally works for people who never learned apps.** Only ~33 % of EU residents aged
  65–74 have basic digital skills; 80+ much fewer. One button and speech remove the barrier.
- **A gap opens in home care.** A Stuttgart care service told us on 7 Nov 2026 that support and
  household help can no longer be billed by care services through the relief amount from January;
  families must find support services themselves (see `docs/validation.md`, still to verify).
- **Reimbursement is moving towards apps that relieve family carers.** Since July 2026 the DiPA
  framework (§40b SGB XI, up to €40/month + €30 support) explicitly includes such apps, with
  provisional listing. No DiPA is listed yet; a reimbursable Nonnina version is a later option,
  not a claim.

## Why we beat the alternatives

| Alternative | What it misses |
| --- | --- |
| Calls, WhatsApp, Google | No overview, no alert when it matters, no help on the spot |
| Hausnotruf / PERS | Only reacts to a button press; no daily company, no help requests, no family picture |
| Care services | Cannot (and soon may not) take on everyday errands; carers become "the girl for everything" |
| Marketplaces for care (generic) | Strangers without family approval; seniors cannot use them |

Nonnina connects the three sides in one loop: the senior speaks, the family acts, a verified
local helper does it, and the relief amount pays where it can.

## Revenue path

1. **Pilot (now):** free, measure time from alert to "I'm on it", sign-ups and willingness to pay.
2. **Family subscription:** €19/month (or €29 with tablet).
3. **Provider subscription:** helpers and support services pay for request management once demand exists.
4. **Later:** DiPA listing for a reimbursable version priced at or below €40/month; B2B with care
   services that want to hand over everyday requests.
