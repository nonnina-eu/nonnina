# ElevenLabs agent configuration – "Lina"

**Source of truth:** `scripts/elevenlabs/agent-config.mjs` (prompt, first messages, tools, data
collection, evaluation, voice/LLM defaults). This file mirrors it for reading; if they differ,
the script wins. Tool names and dynamic-variable names must match
`components/senior/senior-screen.tsx` and `lib/elevenlabs.ts` exactly.

## 1. Primary path: one command

```bash
# preview the exact JSON (works without a key)
node scripts/elevenlabs/setup-agent.mjs --dry-run

# create the agent (or update it if ELEVENLABS_AGENT_ID is set)
ELEVENLABS_API_KEY=sk_... NEXT_PUBLIC_APP_URL=https://<app> node scripts/elevenlabs/setup-agent.mjs
```

The script reads the shell env, then `.env.local` / `.env`. It:

1. Creates or updates the three **client tools** as workspace tools (`POST` / `PATCH /v1/convai/tools`,
   matched by name, so re-running does not duplicate them).
2. Creates (`POST /v1/convai/agents/create`) or updates (`PATCH /v1/convai/agents/{agent_id}`) the
   agent, with `prompt.tool_ids` pointing at those tools (inline `prompt.tools` is deprecated).
3. Prints the agent id and the env lines to paste (`ELEVENLABS_AGENT_ID=…`). It exits non-zero
   and prints the API's validation errors (`detail[].loc` / `msg`) if a call fails.

Optional env: `ELEVENLABS_LLM` (default `gemini-2.5-flash`), `ELEVENLABS_TTS_MODEL` (default
`eleven_flash_v2_5`), `ELEVENLABS_VOICE_ID` (default premade "Sarah" `EXAVITQu4vr4xnSDxMaL`),
`ELEVENLABS_VOICE_ID_IT` (Italian voice for the `it` preset), `ELEVENLABS_POST_CALL_WEBHOOK_ID`
(pins the workspace webhook to this agent). Flag `--no-allowlist` skips the hostname allowlist
(use it if you demo from a preview URL that is not `NEXT_PUBLIC_APP_URL`).

What the script configures:

| Setting | Value |
| --- | --- |
| Language | `de` (default) + language preset `it` with the Italian first message; `language_detection` system tool on, so Lina switches when the senior speaks Italian |
| LLM | `gemini-2.5-flash`, temperature 0.2 (low latency, reliable tool calls) |
| TTS | `eleven_flash_v2_5` (multilingual, lowest latency) |
| Timezone | `Europe/Berlin` (so Lina knows the date and time) |
| Auth | `enable_auth: true` (signed URLs only) + allowlist: app hostname and `localhost` |
| Overrides | client may override `agent.language` and `agent.first_message` |
| Data collection | `summary`, `mood`, `problem_category`, `needs_human` |
| Evaluation | `emergency_tool_first`, `truthful_notification` |

> The app currently starts sessions without `overrides`. For an Italian senior the first message
> is German until language detection switches. To greet in Italian, `startSession` in
> `senior-screen.tsx` can pass `overrides: { agent: { language: "it" } }` (already permitted).

### Post-call webhook (workspace-level, set once by hand)

Webhooks are workspace resources; the script does not create them.

1. ElevenLabs → **Agents → Settings → Post-call webhook** → create a webhook:
   URL `https://<app>/api/elevenlabs/webhook`, event **transcript** (`post_call_transcription`).
2. Copy the generated **secret** into `ELEVENLABS_WEBHOOK_SECRET` (Vercel env + `.env.local`), redeploy.
3. Either enable it as the workspace default, or put its id in `ELEVENLABS_POST_CALL_WEBHOOK_ID` and
   re-run the script (sets `platform_settings.workspace_overrides.webhooks`).

The route verifies `ElevenLabs-Signature` (`t=<unix>,v0=<hex HMAC-SHA256 of "<t>.<raw body>">`,
30 min tolerance – same as the official SDK), stores a `voice_sessions` row and, when
`needs_human` is true or the category is `legal` or `money`, creates an `escalated` help request
and informs the priority-1 relative. It must answer 200: ElevenLabs auto-disables webhooks that keep failing.

## 2. Fallback: manual dashboard setup

Only if the script cannot be used. Copy the values below into the dashboard.

1. **Agent tab:** language German; **Additional languages** → Italian with its first message;
   first message, system prompt (below), LLM `gemini-2.5-flash`, timezone Europe/Berlin.
2. **System tools:** enable *Language detection*.
3. **Tools → Add tool → Client** for each tool below, **"Wait for response" ON**.
4. **Voice:** a multilingual voice, model Flash v2.5.
5. **Analysis → Data collection:** the four fields below. Optional evaluation criteria.
6. **Security:** *Enable authentication* ON; allowlist your app host + `localhost`;
   allow overrides for *Language* and *First message*.
7. **Post-call webhook:** as above.

## Dynamic variables (sent by the app at session start)

| Variable | Example | Source |
| --- | --- | --- |
| `senior_name` | `Maria` | `seniors.first_name` |
| `language` | `German` / `Italian` | `seniors.language` |
| `language_code` | `de` / `it` | `seniors.language` |
| `city` | `Stuttgart` | `seniors.city` |
| `next_medication` | `Tabletten um 18:00` | `seniors.medication_times` |
| `relatives_names` | `Anna und Thomas` | `relatives` ordered by priority |
| `senior_token` | `maria-demo` | device token, used by the post-call webhook to find the senior |

The script sets these as `dynamic_variable_placeholders` so dashboard tests do not show raw `{{…}}`.

## First message

**DE (default):** `Hallo {{senior_name}}, schön, Sie zu hören. Wie geht es Ihnen heute?`

**IT (preset `it`):** `Ciao {{senior_name}}, che bello sentirla. Come sta oggi?`

## System prompt

```
You are "Lina", a warm, patient companion for {{senior_name}}, an older person living alone in {{city}}. Their language is {{language}} (code {{language_code}}). Always speak the language the person speaks: German or Italian. If {{language_code}} is "it" or the person speaks Italian, switch to Italian at once. Use the formal "Sie" in German and "Lei" in Italian unless the person asks otherwise. Short, simple sentences, slowly and kindly. Never use technical words. Never rush. Repeat important information once.

Your jobs:
1. Keep them company and listen.
2. Help with simple things: reminders (next medication: {{next_medication}}; call get_next_reminder when asked), the date and time, simple questions.
3. Notice when they need a person, and tell the family ({{relatives_names}}).
4. Notice danger and act immediately.

You are not a doctor and not an emergency service. You cannot call 112 or anyone yourself, and you never pretend to. Never give a diagnosis, medication doses or legal advice. Never tell them not to call 112. If asked, say honestly that you are a computer voice, not a person.

SAFETY RULES (highest priority, override everything else):
- EMERGENCY: a fall they cannot get up from, chest pain, difficulty breathing, signs of a stroke (face drooping, weak arm, slurred speech), someone nearby unconscious, fire, heavy bleeding, or they want to hurt themselves. Call trigger_emergency with level "emergency", a short English reason and their exact words as quote. Do this BEFORE saying anything else. Do not ask questions first.
- WARNING: dizzy, confused, fell earlier but feels OK, has not eaten, missed medication, very sad. Call trigger_emergency with level "warning".
- When in doubt between warning and emergency, choose emergency.

USE THE REAL TOOL RESULT. Never say that someone was informed unless the tool result says so. Wait for the result, then answer according to it:
- "relatives_notified": say that {{relatives_names}} have just been notified. For an emergency add: "Bitte rufen Sie trotzdem jetzt die 112 an, der rote Knopf ist auf dem Bildschirm."
- "demo_mode_logged_no_sms_sent": this is a demo, no message went out. Say the alarm is shown on the screen and their family will see it in the app. For an emergency add that they should call 112 now with the red button.
- "warning_countdown_started": say kindly that you will let their family know in a few seconds, and that they can press the button on the screen if they are fine.
- "notification_failed_tell_senior_to_call_112", any other error, or no result: say clearly that the message did not go through, and that they must call 112 now or press the red button on the screen. Do not say the family knows.
After an emergency: stay with them, keep them calm, tell them not to stand up after a fall, and to unlock the door if they safely can.

HELP REQUESTS:
- Practical help (shopping, cleaning, appointments, food), problems with letters, contracts, money, care insurance or their carer, loneliness, or they simply ask for a person: call create_help_request with a category (daily_help, legal, money, health, loneliness, other) and a one-sentence English summary.
- "family_informed": say "Ich sage Ihrer Familie Bescheid, sie kümmert sich darum."
- "saved_family_will_see_it_in_the_app": say it is written down, their family will see it in the app and take care of it.
- "failed_tell_senior_to_try_again_or_press_help", any other error, or no result: say it did not work, and ask them to try again in a moment or press the help button on the screen. Do not say the family knows.
- Legal and money questions are never solved by you: the family will check them with a counsellor.

STYLE: Max 2 short sentences per reply. Ask one question at a time. If you did not understand, say so kindly and ask again.

ITALIANO (se la persona parla italiano):
- Dia sempre del "Lei", frasi brevi, al massimo due per risposta.
- Emergenza, dopo "relatives_notified": "Ho avvisato subito {{relatives_names}}. Per favore chiami comunque il 112, il pulsante rosso è sullo schermo."
- Dopo "notification_failed_tell_senior_to_call_112": "Il messaggio non è partito. Chiami subito il 112 o prema il pulsante rosso sullo schermo."
- Richiesta di aiuto, dopo "family_informed": "Lo dico alla sua famiglia, se ne occuperà lei."
- Dopo "failed_tell_senior_to_try_again_or_press_help": "Non ha funzionato. Riprovi tra un momento o prema il pulsante di aiuto sullo schermo."
- Lei non è un medico né un servizio di emergenza: niente diagnosi, niente dosi, non chiama mai il 112 da sola.
```

## Client tools (type `client`, `expects_response: true` = "Wait for response")

### `trigger_emergency` (timeout 30 s)
Alert the family immediately. Returns `relatives_notified` · `demo_mode_logged_no_sms_sent` ·
`warning_countdown_started` · `notification_failed_tell_senior_to_call_112`.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `level` | string (enum: `emergency`, `warning`) | yes | `emergency` = notify now, `warning` = ask the family to check in soon |
| `reason` | string | yes | Short reason in English, e.g. "fall, cannot get up" |
| `quote` | string | yes | The senior's exact words |

### `create_help_request` (timeout 20 s)
Non-urgent help request. Returns `family_informed` · `saved_family_will_see_it_in_the_app` ·
`failed_tell_senior_to_try_again_or_press_help`.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `category` | string (enum: `daily_help`, `legal`, `money`, `health`, `loneliness`, `other`) | yes | Type of help |
| `summary` | string | yes | One-sentence summary in English |

### `get_next_reminder` (timeout 10 s)
Returns the next medication reminder as text. No parameters.

## Analysis → Data collection

| Field | Type | Description |
| --- | --- | --- |
| `summary` | string | Two-sentence summary of the conversation |
| `mood` | string | One of: good, ok, low, worried |
| `problem_category` | string | daily_help, legal, money, health, loneliness, other, or none |
| `needs_human` | boolean | true if the senior needs a person from the family |

## 3. Verification checklist (before the demo)

### Automated behaviour tests (run after every prompt change)

```bash
node scripts/elevenlabs/run-tests.mjs
```

Runs 10 tests on the live agent with the ElevenLabs agent-testing API: 6 tool-call tests
(fall DE → `trigger_emergency` emergency, fall IT → emergency, dizzy → warning, Pflegekasse letter →
`create_help_request` legal/money, shopping IT → daily_help, small talk → no emergency) and 4
simulations that check Lina reports the real tool outcome (notified / failed / demo mode, Italian with
"Lei"). Last run 7 Nov 2026 on `agent_1101m6tq1z65e36bzdh1f3vy2kcc` (gpt-4.1, flash v2.5): **10/10 passed**.

### Manual checks

- [ ] `node scripts/elevenlabs/setup-agent.mjs` printed an agent id; `ELEVENLABS_AGENT_ID`,
      `ELEVENLABS_API_KEY`, `ELEVENLABS_WEBHOOK_SECRET` are set in Vercel and the app was redeployed.
- [ ] Open `/demo` (or `/senior/maria-demo`) with DevTools → Console + Network open. Press the talk button:
      `POST /api/elevenlabs/signed-url` returns 200 and a WebSocket to `api.elevenlabs.io` opens.
      A 503 `voice_unavailable` means the env vars are missing on the server; `[voice] error …`
      in the console means an SDK failure (for example a tool that is not registered).
- [ ] *„Wann muss ich meine Tabletten nehmen?"* → Lina reads the reminder (`get_next_reminder`).
- [ ] *„Ich schaffe den Einkauf nicht mehr."* → Network shows `POST /api/help-request`; Lina says the family takes care of it.
- [ ] *„Ich bin gestürzt und komme nicht hoch."* → emergency overlay, `POST /api/emergency` in Network;
      Lina's reply matches the tool result (demo mode: no claim that an SMS went out, tells the senior to call 112).
- [ ] WebSocket frames (Network → the `wss://` entry → Messages) show `client_tool_call` with the
      tool name and parameters; the dashboard → *Conversations* → the call lists every tool call and result.
- [ ] *„Buongiorno, come sta?"* → Lina switches to Italian (language detection).
- [ ] After hanging up: dashboard → *Conversations* → *Analysis* shows the four data-collection values,
      and the family feed shows the summary (webhook).

### Test the webhook with a signed sample payload

Run with the same secret as the server (`pnpm dev` running, or set `URL` to the deployed app):

```bash
ELEVENLABS_WEBHOOK_SECRET=whsec_... URL=http://localhost:3000 node --input-type=module -e '
import { createHmac } from "node:crypto";
const body = JSON.stringify({
  type: "post_call_transcription",
  event_timestamp: Math.floor(Date.now() / 1000),
  data: {
    agent_id: "test", conversation_id: "conv_test_" + Date.now(), status: "done",
    transcript: [{ role: "user", message: "Ich schaffe den Einkauf nicht mehr." }],
    analysis: {
      call_successful: "success",
      transcript_summary: "Maria needs help with shopping.",
      data_collection_results: {
        summary: { data_collection_id: "summary", value: "Maria needs help with the weekly shopping.", rationale: "" },
        mood: { data_collection_id: "mood", value: "low", rationale: "" },
        problem_category: { data_collection_id: "problem_category", value: "daily_help", rationale: "" },
        needs_human: { data_collection_id: "needs_human", value: true, rationale: "" },
      },
    },
    conversation_initiation_client_data: { dynamic_variables: { senior_token: "maria-demo" } },
  },
});
const t = Math.floor(Date.now() / 1000);
const sig = createHmac("sha256", process.env.ELEVENLABS_WEBHOOK_SECRET).update(`${t}.${body}`).digest("hex");
const res = await fetch(`${process.env.URL}/api/elevenlabs/webhook`, {
  method: "POST", headers: { "Content-Type": "application/json", "ElevenLabs-Signature": `t=${t},v0=${sig}` }, body,
});
console.log(res.status, await res.text());
'
```

Expected: `200 {"ok":true,"escalated":true}` and a new escalated help request in the family app.
`401` = secret mismatch, `503` = `ELEVENLABS_WEBHOOK_SECRET` not set on the server, `422` = payload shape.
