# 05 · Market, evidence and what it means for the product

Condensed from `deep-research-report (1).md` ("Silver Society, Instant Care und KI-gestützte
Altenpflege", German, Nov 2026, in the workspace root). Numbers are for the pitch and for
product decisions; recheck sources before official use. Market sizes overlap and must not be
added up.

## Numbers worth quoting (Germany unless stated)

| Fact | Value |
| --- | --- |
| People receiving care-insurance benefits, 2025 | 6.43 M, of which 5.52 M cared for **at home** |
| People 80+ | ~6 M today → 8.5–9.8 M in 2050 |
| Projected professional-care staff gap by 2049 | 280 000 (trend) to 690 000 (status quo) |
| Care need at 80–84 | ~25 % of men, 35 % of women; 90+: 70 % / 86 % |
| EU share 65+, 2024 | 21.6 % (80+: 6.1 %) |
| PERS / emergency-call-system market 2026 | ~9 bn USD, CAGR 8.8 % |
| AI in aging & elderly care 2026 | ~68 bn USD, CAGR 23.8 % (very broad definition) |
| Internet use 65–74 in DE, 2025 | 87 % used it, but only ~33 % of EU 65–74 have basic digital skills; 80+: ~37 % use the internet (2022) |
| Hausnotruf reimbursement | care-insurance supplement, new GKV contracts since Apr 2026, ideally no extra cost for eligible people |
| DiPA (digital care application) reimbursement | up to 40 €/month + 30 € support; framework widened Jul 2026 to apps that relieve family carers; so far **zero** listed DiPA |

## Evidence: what works, what is overrated

- Remote monitoring of selected high-risk patients reduces hospitalisations (RCT, n=534: 40.4 % vs 48.7 %); but a 2026 RCT (n=1 286) found no benefit and worse results for 65+ in some arms. **More monitoring ≠ better outcomes.**
- Companion / social AI: small RCTs show less loneliness (Japan, n=73). Early but positive.
- Generative-AI triage for older people: **insufficient evidence for autonomous clinical decisions.** AI must stay an escalation and prioritisation layer with a human responsible.
- Fall-prediction wearables: sensitivity 55 %, specificity 89 % – risk stratification, not a safety guarantee.

## The thesis that matches our product

> "The biggest value is not the device, but the shorter distance between signal and a
> meaningful intervention." A sensor that detects a fall creates little value if nobody reacts.

That is exactly Nonnina's loop: signal (voice, button) → deterministic triage → the right
human (relative → fallback → 112 button) → documented outcome → family informed.

The report's "ideal instant-care path": low priority → reminder/self-help · medium → relatives
or carer · high → telemedicine · acute → 112. Our MVP implements low, medium and the
hand-off to acute. Telemedicine and certified dispatch are partner integrations later.

## Design principles the research supports (keep them)

1. **As little app interaction as possible for the 80+ user.** Voice, one button, no login. Smartphone-centric workflows do not scale for the very old.
2. **Alarm quality over sensor density.** Fewer, better alerts; two levels (warning/emergency); dedupe; a human always confirms. Alarm fatigue kills adoption.
3. **Granular visibility for the family instead of live surveillance**: "all normal", "unusual", "acute". Autonomy of the senior matters (consent, no recordings).
4. **Privacy by design**: health data (GDPR art. 9), EU hosting, summaries not audio, edge where possible. EU AI Act applies since Aug 2026; our assistant is not a medical device as long as it gives no diagnosis or treatment – keep it that way.
5. **Measure outcomes, not AI accuracy**: time from alert to acknowledgement, false-alarm rate, events handled by family without 112, days at home. Log them from day one (we already store `notified[]` with timestamps).

## Competitors and where we differ

Hausnotruf providers (Patronus, libify, easierLife) sell hardware + call centre; VmedD sells
contactless sensors (239 € + 12.95 €/month); ElliQ sells a companion robot (39–59 USD/month).
Nonnina is software on a tablet the family already owns, voice-first, with the family (not a
call centre) in the loop, and – Layer 2 – the money and legal guidance nobody else bundles.

## Business model (from the pitch doc) and the reimbursement angle

Free basic voice assistance for the senior, **family subscription** for coordination and
guidance, later provider subscriptions. Reimbursement routes to explore after the MVP: DiPA
(now open to apps that relieve family carers, up to 40 €/month) and the Hausnotruf supplement
via a certified partner. B2B2C through care insurers or senior-living operators is the
report's recommended long-term route.
