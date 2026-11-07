# 07 · Pricing strategy

Source: `reference/pricing-report.md` (German market pricing for Hausnotruf, AI elderly care and
DiPA, Nov 2026) plus `05-market-and-evidence.md`. All competitor prices below are copied from
those two files; recheck before official use. Our own prices are **hypotheses to test in the
Stuttgart pilot**, not published tariffs.

## Recommendation (slide 4)

The senior never pays and never sees a price. The **family pays one subscription per senior**:
**Nonnina Familie at €19/month** (cancel monthly) with the family's own tablet, or **Nonnina
Familie + Tablet at €29/month on a 24-month term**, where we ship a pre-configured tablet with
the one-button screen. Both include the voice companion Lina (DE/IT), real-time alerts, the
escalation ladder (SMS + calls, "press 1 to confirm"), help requests and call summaries, for
**all relatives at no extra cost**. Layer 2 (benefits and paperwork guide) is added to the same
plan when it ships; Layer 3 (local helpers) is paid by providers, not families. The Stuttgart
pilot is free. Later we prepare a reimbursable DiPA version priced at or below €40/month,
but only after a BfArM listing, which we do not have.

## Comparable products

| Product | What it is | Price | Source |
| --- | --- | --- | --- |
| easierLife HOME Family | Emergency system, family (not call centre) responds | €19.95/month + €49.90 setup | pricing-report |
| easierLife HOME | Same, with 24/7 monitoring centre | €29.95/month + €49.90 setup | pricing-report |
| libify Basic / Home / Mobil 2.0 | Hausnotruf with 24/7 centre | €32.13 / €41.68 / €44.68 per month | pricing-report |
| Patronus Light | Classic Hausnotruf | €30.30/month without Pflegegrad | pricing-report |
| Malteser Grundsicherheit → Komplettsicherheit Plus | Hausnotruf, up to local response + activity sensing | €27 → €60.40 → €64.90 per month | pricing-report |
| VmedD Care Monitor | Contactless sensors, automated family alerts | €239 first sensor + €12.95/sensor/month | pricing-report, 05 |
| LINDERA L.Home | Smartphone app, mobility/fall-risk analysis | €10.42–11.66/month (€13.99 single) | pricing-report |
| ElliQ | AI companion device (US) | US$39–59/month + US$249 initiation | pricing-report, 05 |
| DiPA (§40b SGB XI) | Reimbursement ceiling for listed digital care apps | up to €40/month + up to €30/month support | pricing-report, 05 |

Hausnotruf prices can fall close to €0 for the user when the Pflegekasse approves the
supplement (e.g. libify Home €9.55 user share). We are **not** in that category and must not
compare ourselves to the reimbursed price.

## Reasoning

### Willingness-to-pay layers (pricing report)

| Layer | Monthly band | Main cost |
| --- | --- | --- |
| App-only: reminders, caregiver support | ~€10–20 | software, support, compliance |
| Passive sensors, no staffed response | ~€13–30 + hardware | sensors, cloud, alerts |
| Family-response emergency system | ~€20–35 | connectivity, device amortisation |
| Professional 24/7 Hausnotruf | ~€30–45 | monitoring centre |
| Hausnotruf + local response / sensors | ~€55–65+ | human intervention |
| AI companion device | ~€35–60 equivalent | hardware lease, AI, cloud |

### Where Nonnina sits

- Software plus a tablet, **no 24/7 call centre**: the family is the responder. That puts us
  between "app-only" and "family-response system", i.e. €19–29.
- The closest twin is easierLife HOME Family (€19.95). €19 matches it while adding voice
  company, help requests and (later) benefits guidance that nobody else bundles.
- The report's own self-pay entry recommendation is €19/month, "below the DiPA ceiling".
- We must stay clearly **below** call-centre Hausnotruf (€27–45). Pricing at €39+ would
  invite a comparison we lose: they have staffed 24/7 response, we do not.
- The report warns that human response is what drives cost up. We have none, so our margin
  depends on AI voice minutes, SMS/calls (Twilio) and support. Track alerts per senior, false
  alarms and support time from day one.
- Extra relatives are free: the report suggests a €5–9 caregiver add-on, but the escalation
  ladder only works if several relatives are in it. Charging per relative weakens safety.

### Tablet: bring-your-own vs bundle

| Option | For whom | Price | Note |
| --- | --- | --- | --- |
| Bring your own | Family has a spare tablet | €19/month | QR-code linking already in the MVP; no hardware risk for us |
| Bundle | Family wants it plug-and-play | €29/month, 24 months | The €10 difference amortises the tablet; check against the real device cost before publishing |

The report notes 12–24-month terms are normal where hardware is leased (ElliQ, Patronus) and
that setup fees exist (easierLife €49.90). We avoid a setup fee to keep the entry simple;
remote self-setup by the family (QR code) is our margin lever.

### DiPA (§40b SGB XI) as the reimbursement path

- What it pays: up to **€40/month** for one or more listed DiPA **combined**, plus up to
  **€30/month** for necessary support by an ambulatory care service. Anything above is self-pay.
- Why it fits: since **July 2026** the definition includes apps that relieve family carers or
  stabilise home care, and BfArM allows **provisional listing for up to one year**.
- What it requires: a BfArM listing (quality, data security and evidence costs), a person in
  need of care living at home, and an approved claim with the Pflegekasse.
- Reality: so far **zero DiPA are listed** and the BfArM DiPA API returns no data.
- Price rule: a DiPA version should cost **≤ €39–40/month** so the user pays nothing; at €49
  the user pays €9. Do not include tablet costs in that price.
- Status for the deck: "a path we are preparing", never "reimbursable".

### Italy

The sources contain no Italian prices or reimbursement rules. Plan: same model (free for the
senior, family pays), price to be validated with Italian families; the Italian-speaking
diaspora in Germany is the bridge market. Do not quote an Italian price in the deck.

### Later revenue (not on slide 4 as numbers)

- Providers (Layer 3): subscription for verified listings; amount to be tested.
- B2B2C via care insurers or senior-living operators: the report's recommended long-term route
  (benchmark €8–12 per active client/month for software-only workflows, recommended, not observed).

## Pilot pricing and testing willingness to pay

- **Stuttgart pilot: free**, consistent with the website FAQ ("It is free during the pilot in
  Stuttgart. We will share pricing with the waitlist first") and "we can send a tablet that is
  already set up".
- Pilot is free for a fixed period (e.g. 3 months), announced up front, so it does not become
  permanently free.
- In interviews with adult children (David):
  1. "What do you pay today for anything that keeps your parent safe (Hausnotruf, phone plan, help)?"
  2. Show the product, then: "At what monthly price is this too expensive / so cheap you doubt it?"
     (Van Westendorp, four questions).
  3. Test €19 vs €29 with tablet: "Which would you choose and why?"
  4. Commitment test: "Can we reserve you a paid place after the pilot?" (waitlist with a price).
- Count answers, not opinions: number of interviews, median "too expensive" price, share
  choosing the tablet bundle. Put the real numbers on slide 3, not invented ones.

## What the deck may say / must not say

> **May say**
> - "Free for seniors. Families pay €19/month (or €29 with a ready-to-use tablet). Free in the Stuttgart pilot."
> - "Priced like a family-response system, not like a call-centre Hausnotruf."
> - "Comparable: easierLife HOME Family €19.95, Hausnotruf with call centre €27–45 (public prices)."
> - "DiPA (§40b SGB XI, up to €40/month) is a reimbursement path we are preparing."
>
> **Must not say**
> - That Nonnina is reimbursable, listed as DiPA, or covered by the Pflegekasse today.
> - That Nonnina calls 112, replaces Hausnotruf or is an emergency service.
> - Any price, saving or market number not in this file, `05-market-and-evidence.md` or the
>   pricing report. No Italian prices. No "families save X €".
> - That prices are final: they are pilot hypotheses.

## Slide version (3 lines)

**Free for the senior. Families pay €19/month – €29 with a ready-to-use tablet. All relatives included.**
**Priced below call-centre Hausnotruf (€27–45) and alongside family-response systems (€19.95).**
**Free during the Stuttgart pilot · DiPA reimbursement (up to €40/month) is a path we are preparing.**
