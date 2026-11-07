# Validation: who we talked to and what we changed

Hackathon day, 7 Nov 2026, Stuttgart. Notes taken during the conversations, condensed here.
Names of interviewees are left out on purpose: we cite the organisation and role only.

## The customer we build for

**Dr. Julia, 48** (persona from our team notes).
She moved to a big city for her studies and career. Her grandmother, 85, still lives alone in
her hometown, has **care level 1** and a growing need for help.

- **Relationship:** she loves caring for her grandmother.
- **Problem:** distance. The trip takes effort, so she visits less often than she would like, and that weighs on her.
- **Today:** phone calls, WhatsApp and Google searches. She never knows for sure whether her grandmother is really looked after.
- **Need:** closeness despite the distance, and the certainty that her grandmother is fine when she is not there.
- **Success:** "I don't have to keep driving there or calling to feel at ease."

The paying customer is the adult child or grandchild (40–60) who lives away. The user is the
person aged 70+ living alone, who must never need an app.

## The questions we asked care providers

1. Think of last week: which tasks do clients give you as a carer that are not your job but still cost you time?
2. How often does that happen in a day?
3. Would you use a service in your organisation that answers exactly these questions and requests?

## Conversations on 7 Nov 2026

### 1. Pflegezentrum Paulinenpark, assisted living (Stuttgart-Killesberg)

- Everything that is not care runs outside the care team: laundry service, cleaning, cultural events.
- Residents are not "confronted" with it, they simply go elsewhere; the usual place is the Karlshöhe.

**What we learned:** in assisted living the non-care needs already have a channel. Our first
customer is **not** the assisted-living resident but the senior living alone at home.

### 2. Home-care service Stuttgart-West (Botnang)

- Call-backs for clients and relatives are put straight through to the office.

**What we learned:** relatives call the care service because they have no other window into
the day. That is the gap the family dashboard closes.

### 3. Home-care service IMPULS, Bad Cannstatt (conversation with the management)

**The rule change they described (as reported to us, not yet verified by us):**

- Care services may no longer bill support and household help through the relief amount
  (Entlastungsbetrag); the federal government decided it, and the benefit is being renamed.
- These services move to pure support services (Betreuungsdienste) without nursing staff:
  shopping, walks, lifts to the doctor, everything outside basic and medical care.
- Until now this was a standard service billed through the relief amount: today **131 € per
  month from care level 1**.
- From January this provider has to decline such requests. Clients are informed and must find
  a replacement themselves or through their relatives.

**Problems with the new support services:**

- Care services often do not know these companies.
- The companies are actively poaching carers.
- **Strangers are a problem for clients.** Many are not familiar with modern technology, so
  **relatives have to organise it.**
- Some clients drop their carer because they now pay for these services themselves.

**The everyday requests carers get anyway:**

- Taking out the rubbish, the TV does not work.
- Explaining a letter the client does not understand.
- Phone and digital things, looking at the post.
- Bringing bread rolls or shopping.
- Clients with household help (once a week or month) ask because the carer is there anyway.
  The carer becomes "the girl for everything".

**How often:** every day on the rounds, from occasionally to several times a day. Many carers
do it gladly, some do not.

**How it is handled today:** the carer decides alone: do it, decline, or pass it to the office.
The office decides by capacity and bills it extra if enough relief amount is left. The
alternative is an own service unit inside the company.

## What changed in Nonnina because of these conversations

| Insight | Change in the product (all live in this repo) |
| --- | --- |
| Small everyday needs (TV, post, a letter, shopping) land on carers every day | Lina turns any spoken need into a **help request** for the family (`create_help_request` tool, `/app`) |
| Trust in strangers is the blocker; relatives have to organise | Marketplace with **verified** helpers and family approval; contact details only after the helper accepts (`/helpers`) |
| The 131 € relief amount is the money families already have, but nobody tracks it | **Relief budget card** on the family dashboard: covered, remaining, family pays extra, carry-over (`lib/relief-budget.ts`, `components/family/relief-budget-card.tsx`) |
| Only recognised providers can be reimbursed | Helpers carry a **"Payable via relief amount (131 €)"** badge set by the team, never by the helper |
| Seniors are not familiar with modern technology | One button, voice only, large type, DE/IT, a code-entry page and a "remember this tablet" cookie (`/senior`) |
| Relatives are the ones who act | Escalation ladder: SMS and call to relatives in order, "press 1 to confirm", "Anna kümmert sich" on the tablet |

## What we still need to verify

- The January date and the new name of the relief amount, as described by IMPULS. Our rule table
  (`docs/reference/original-team-plan.txt`, Part 5) still uses "Entlastungsbetrag, 131 €/month
  from care level 1; 2026 leftovers usable until 30 June 2027".
- Willingness to pay of families: "Would you pay €19 a month for this?" is the first question of
  the Stuttgart pilot (see `docs/07-pricing.md`).
- Waitlist sign-ups on nonnina.eu are the first traction signal; we report the real count in the
  deck, never an estimate.
