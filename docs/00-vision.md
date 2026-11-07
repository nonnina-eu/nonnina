# 00 · Vision – what we are building

> Source of truth for the product idea. Derived from `reference/care-copilot-how-it-works.txt`
> (team plan of 7 Nov 2026) plus the product owner's brief of the same day. If this file and
> the code disagree, fix the code or update this file – never leave both.

## One sentence

**Nonnina** (formerly Care Copilot) is a voice companion for an older person living alone.
It keeps them company, helps with small things, notices when they need a person, tells the
family in real time what is going on, and in an emergency gets help moving within seconds.

Tagline: *One button for the parent. One clear plan for the family.*

## The product owner's brief (7 Nov 2026, paraphrased)

The assistant must:

1. **Keep the senior company** – talk, listen, answer simple questions, remind about medicine.
2. **Assist** – help with everyday needs and recognise when a human must step in.
3. **Communicate the senior's needs to the relatives** – every request that the AI cannot
   solve becomes a help request the family sees.
4. **In an emergency, get help** – the assistant itself starts the rescue chain (see the
   decision in `02-emergency-and-family-flow.md`), and
5. **Tell the relatives in real time what happened** – who was alerted, what the senior said,
   who is handling it, when it is over.

It is a **web application**, and it must be **simple**: one screen for the senior, one small
app for the family. We reuse existing pieces (Supabase Auth, ElevenLabs React SDK, Twilio,
shadcn/ui) instead of building them.

## Three people, three screens

| Person | Screen | What they get |
| --- | --- | --- |
| **Senior** (Maria, 82, Stuttgart, care level 3) | Tablet in the kitchen, one big button, no login | Company, reminders, a way to ask for help, an emergency path that always works |
| **Family** (Anna, 52, daughter in Munich) | Phone, logged in | Real-time alerts, call summaries, help requests, who-is-on-it, later: legal check + money + steps |
| **Helpers** (services, agencies, independents) | Marketplace | *Not in the MVP* (Layer 3). Verified listings families can book |

The paying customer is the family.

## Problems we solve (from the plan)

- **Alone** – the parent is alone, the family finds out late. Small problems become big ones. → *The MVP solves this one.*
- **Grey zone** – home care is often illegal without people knowing (live-in carers, undeclared work). → Layer 2 traffic light. Post-MVP.
- **Unused money** – care insurance pays at least seven separate benefits; families miss up to ~173 €/month. → Layer 2 rule table. Post-MVP.

## Core idea

Every request the senior speaks ends in a solution: the AI solves it now, or the family gets
it with a plan, or (later) a verified person comes. **Nothing the senior says gets lost.**

## Non-negotiable principles

1. **The emergency path never depends on the AI.** Red button and keyword net work without voice, without the LLM, and (for the button) without network.
2. **Rules live in code, not in the model's judgement.** When to escalate, when to call, benefit amounts – fixed tables and functions with unit tests.
3. **Not an emergency service, not a doctor, not a lawyer.** Every screen says "orientation, not legal or medical advice". We never tell someone not to call 112.
4. **Privacy by design.** Care data is health data under GDPR: EU region, consent, no voice recordings kept (summaries only), relatives see data only when invited.
5. **Simple beats complete.** No menus, no scrolling, no passwords for the senior. One screen. Large text. Two languages (DE, IT).
6. **Every integration degrades gracefully.** No keys → demo mode, never a crash.

## Scope of the MVP (what "valid MVP" means for us)

A family member can sign up, create the senior's profile, link the tablet with a QR code,
add relatives with phone numbers. The senior talks to the assistant. A help request or an
emergency appears on the relatives' phones within seconds (SMS + live feed), the priority
relative gets a voice call, someone presses "I'm on it", the senior sees that help is coming,
and the all-clear closes the loop. Everything runs on real services (Supabase, ElevenLabs,
Twilio), not only demo mode.

Out of scope for the MVP: marketplace, benefits calculator, legal traffic light, payments,
native apps, certified Hausnotruf integration.
