# 02 · Emergency flow and family communication

This is the heart of the product. Everything here is deterministic code with tests, not AI
judgement. Times are defaults; make them configurable per family later.

## The brief vs. the law: who calls 112?

The product owner asked that the assistant **itself calls for help** in an emergency and
tells the relatives in real time. We implement that as an **escalation ladder that the app
drives automatically**, with one deliberate limit for the MVP:

**The app does not dial 112 on its own.** Reasons, so we do not re-discuss this:

1. **Carrier rules.** Twilio only routes emergency calls from numbers with a registered
   emergency address in supported countries, and a cloud voice bot has no verified location;
   a 112 call with no human on the line and no verified address is not accepted.
2. **Liability.** False alarms to 112 are an offence (DE §145 StGB, IT art. 658 c.p.). A
   mis-heard keyword must not be able to trigger one.
3. **Certification.** Automatic emergency dialling is the job of certified *Hausnotruf* /
   teleassistenza providers (DIN EN 50134, paid by the care insurance up to 27 €/month). We
   are not one; we can integrate one later (post-MVP).

What the app **does** do automatically, within seconds and without any human in our loop:

- Puts the tablet in emergency mode with a **one-tap 112 button** (`tel:112`) and Lina telling the senior to press it, and speaking calmly in the meantime.
- **Alerts every relative** (SMS now, push later) with the senior's exact words and a link.
- **Voice-calls the relatives in priority order** with a spoken message until someone confirms.
- If no relative confirms, **voice-calls the family's configured fallback number** (neighbour, carer, or a Hausnotruf/teleassistenza service the family already pays for). The family sets this number during onboarding; the field can be empty.
- Keeps the relatives updated in real time: notified → someone is on it → all clear.

That is "the assistant calls for help" in a way that is legal today and upgradeable to a
certified emergency partner later.

## Levels

| Level | Meaning | Senior screen | Relatives |
| --- | --- | --- | --- |
| **emergency** | Life or health at risk now | Full-screen red mode, 112 button, "Anna wurde benachrichtigt", button "Mir geht es gut" | Ladder below, immediately |
| **warning** | Something is off, not acute | Calm banner, 15 s countdown the senior can cancel | After the countdown: SMS "please check in soon"; no call |

## The escalation ladder (level = emergency)

```
t = 0 s    Event created (source: agent_tool | keyword_detector | manual_button | no_response)
           Tablet → emergency mode. Lina: "Ich habe … benachrichtigt. Bitte 112 drücken."
t = 0 s    SMS to ALL relatives with notify_sms = true  (+ email if present)
t = 0 s    Voice call to priority-1 relative (Twilio TTS):
           "Nonnina Notruf. Maria in Stuttgart sagte: '…'. Drücken Sie 1, wenn Sie sich kümmern."
t = 90 s   No ack → voice call to priority-2 relative (same message)
t = 180 s  No ack → voice call to priority-3 … (until relatives are exhausted)
t = N      No ack from anyone → voice call to family fallback number (if set)
           SMS to all: "Niemand hat bestätigt. Bitte 112 anrufen."
Any time   Relative presses "I'm on it" (app, or key 1 in the call) → status acknowledged,
           ladder stops, tablet shows "Anna kümmert sich.", other relatives get "Anna kümmert sich".
Any time   Senior presses "Mir geht es gut" → cancelled_by_senior, all-clear SMS to all.
```

Implementation note: the ladder needs a server-side timer that survives serverless cold
starts. Options: Vercel Cron every minute reading open events (`status = relatives_notified`,
`next_step_at <= now`), or Supabase `pg_cron` + Edge Function, or Twilio status callbacks.
MVP choice: **Vercel Cron + `escalation_step`/`next_step_at` columns on `emergency_events`**.
Simple, visible, testable.

## Status machine (`emergency_events.status`)

```
open ──notify ok──▶ relatives_notified ──ack──▶ acknowledged
 │                          │                        │
 └── senior cancel ─────────┴── senior cancel ───────┴──▶ cancelled_by_senior
```
`open` stays only if every notification failed; the tablet then says "Bitte rufen Sie 112 an"
and the server retries in the background.

## What relatives see in real time

Family feed (`/family/[familyId]/alerts`, later behind login at `/app`):

- New **emergency** card at the top within seconds (Supabase Realtime on `emergency_events`): level, time, the senior's exact words, source, who was notified and how (SMS sent / call answered / failed), big button **"I'm on it"**, link "Call Maria".
- **Warning** cards, **help requests** (category, summary, status), **call summaries** (mood, 2-sentence summary).
- Status updates on the same card: "Anna is on it · 10:14", "Maria says she is fine · 10:19".

Channels, in order of reliability: live feed (needs the page open) → SMS (always) → voice call (priority relative) → email (optional) → web push (post-MVP, replaces "page must be open").

## Messages (DE/IT, from `lib/notify.ts`)

- Emergency: `Nonnina: NOTFALL bei Maria (Stuttgart). Sie sagte: "…". Bitte sofort anrufen oder 112 wählen. <link>`
- Warning: `Nonnina: Bitte melden Sie sich bald bei Maria. Grund: … <link>`
- Help request: `Nonnina: Maria braucht Hilfe (nicht dringend): … <link>`
- All clear: `Nonnina: Maria sagt, es geht ihr jetzt wieder gut. <link>`
- Acknowledged (to the others): `Nonnina: Anna kümmert sich um Maria. <link>` *(to add)*
- Nobody confirmed: `Nonnina: Niemand hat bestätigt. Bitte Maria anrufen oder 112 wählen. <link>` *(to add)*

## No-response check (source `no_response`) – post-MVP

If the senior has not pressed the button or spoken for a configurable time (e.g. 24 h), or did
not react to a medication reminder, Lina speaks ("Maria, ist alles in Ordnung?"). No answer →
`warning` to the family. Not in the MVP, but the enum value already exists.

## Help requests (non-urgent needs)

`help_requests.status`: `open → ai_solved | escalated → matched` (matched = Layer 3). The
family marks a request done from the feed. Priority-1 relative gets one SMS per request; others
see it in the feed only.

## What exists today vs. what the MVP still needs

| Piece | Status |
| --- | --- |
| Event creation, dedupe, SMS to all, call to priority-1, logging `notified[]` | ✅ built |
| Tablet emergency mode, 112 button, "I'm fine", warning countdown | ✅ built |
| Realtime family feed, "I'm on it" (acknowledge), all-clear SMS | ✅ built |
| Escalation ladder (timer, priority-2…n, fallback number, "nobody confirmed") | ✅ built – `lib/escalation-ladder.ts` (pure, tested), `lib/escalation-runner.ts`, `/api/cron/escalate` every minute via `vercel.json`, `CRON_SECRET` |
| "Press 1 to confirm" in the voice call (Twilio Gather → ack) | ✅ built – `/api/twilio/voice` (TwiML + Gather) and `/api/twilio/gather` (digit 1 → acknowledge), signature-verified |
| "Anna is on it" message to the other relatives | ✅ built – kind `acknowledged` in `lib/notify.ts`, sent on app ack and on key 1 |
| `fallback_phone` on `families` | ✅ built – migration `0002`, used by the ladder after the relatives |
| Web push for relatives | ⏭ post-MVP |
| No-response check | ⏭ post-MVP |
| Certified Hausnotruf partner | ⏭ post-MVP |
