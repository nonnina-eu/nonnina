// Single source of truth for the ElevenLabs agent "Lina".
// Used by scripts/elevenlabs/setup-agent.mjs and mirrored in docs/elevenlabs-agent.md.
// Tool names, parameter names and dynamic-variable names must match
// components/senior/senior-screen.tsx and lib/elevenlabs.ts exactly.

export const AGENT_NAME = "Nonnina – Lina";

/** Placeholders shown in the dashboard preview; the app sends real values at session start. */
export const DYNAMIC_VARIABLE_PLACEHOLDERS = {
  senior_name: "Maria",
  language: "German",
  language_code: "de",
  city: "Stuttgart",
  next_medication: "Tabletten um 18:00",
  relatives_names: "Anna und Thomas",
  senior_token: "maria-demo",
};

export const FIRST_MESSAGES = {
  de: "Hallo {{senior_name}}, schön, Sie zu hören. Wie geht es Ihnen heute?",
  it: "Ciao {{senior_name}}, che bello sentirla. Come sta oggi?",
};

/** Exact strings the client tools return (components/senior/senior-screen.tsx). */
export const TOOL_RESULTS = {
  trigger_emergency: ["relatives_notified", "demo_mode_logged_no_sms_sent", "warning_countdown_started", "notification_failed_tell_senior_to_call_112"],
  create_help_request: ["family_informed", "saved_family_will_see_it_in_the_app", "failed_tell_senior_to_try_again_or_press_help"],
};

export const SYSTEM_PROMPT = `You are "Lina", a warm, patient companion for {{senior_name}}, an older person living alone in {{city}}. Their language is {{language}} (code {{language_code}}). Always speak the language the person speaks: German or Italian. If {{language_code}} is "it" or the person speaks Italian, switch to Italian at once. Use the formal "Sie" in German and "Lei" in Italian unless the person asks otherwise. Short, simple sentences, slowly and kindly. Never use technical words. Never rush. Repeat important information once.

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

USE THE REAL TOOL RESULT. The tool returns JSON: {"ok":true or false,"notified":true or false,"mode":"...","error":null or a short reason}. "notified" is true ONLY when an SMS, a call or an email was actually sent. Never tell the senior the family was informed unless "notified" is true. Wait for the result, then answer according to "mode":
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
- Lei non è un medico né un servizio di emergenza: niente diagnosi, niente dosi, non chiama mai il 112 da sola.`;

/** Client tools, created/updated as workspace tools (POST/PATCH /v1/convai/tools) and attached via prompt.tool_ids. */
export const CLIENT_TOOLS = [
  {
    type: "client",
    name: "trigger_emergency",
    description:
      'Alert the family immediately when something serious has happened or is about to happen. Call it before speaking. Returns JSON {ok, notified, mode, error}. notified is true only if a real message was sent. mode is one of: "relatives_notified", "demo_mode_logged_no_sms_sent", "warning_countdown_started", "notification_failed_tell_senior_to_call_112".',
    expects_response: true,
    response_timeout_secs: 30,
    parameters: {
      type: "object",
      required: ["level", "reason", "quote"],
      properties: {
        level: {
          type: "string",
          enum: ["emergency", "warning"],
          description: '"emergency" = notify the family now; "warning" = ask the family to check in soon.',
        },
        reason: { type: "string", description: 'Short reason in English, e.g. "fall, cannot get up".' },
        quote: { type: "string", description: "The senior's exact words." },
      },
    },
  },
  {
    type: "client",
    name: "create_help_request",
    description:
      'Create a non-urgent help request for the family. Returns JSON {ok, notified, mode, error}. notified is true only if a real message was sent. mode is one of: "family_informed", "saved_family_will_see_it_in_the_app", "failed_tell_senior_to_try_again_or_press_help".',
    expects_response: true,
    response_timeout_secs: 20,
    parameters: {
      type: "object",
      required: ["category", "summary"],
      properties: {
        category: {
          type: "string",
          enum: ["daily_help", "legal", "money", "health", "loneliness", "other"],
          description: "Type of help needed.",
        },
        summary: { type: "string", description: "One-sentence summary in English of what the senior needs." },
      },
    },
  },
  {
    type: "client",
    name: "get_next_reminder",
    description:
      "Returns the next medication reminder as text, in the senior's language. Call it when they ask about their pills or medication time.",
    expects_response: true,
    response_timeout_secs: 10,
    parameters: { type: "object", required: [], properties: {} },
  },
];

/** platform_settings.data_collection – read by app/api/elevenlabs/webhook/route.ts. */
export const DATA_COLLECTION = {
  summary: { type: "string", description: "Two-sentence summary of the conversation in English, for the family." },
  mood: { type: "string", description: "The senior's mood. Exactly one of: good, ok, low, worried." },
  problem_category: {
    type: "string",
    description: "Main problem, exactly one of: daily_help, legal, money, health, loneliness, other, none.",
  },
  needs_human: {
    type: "boolean",
    description: "true if the senior needs a person from the family to follow up, otherwise false.",
  },
};

export const EVALUATION_CRITERIA = [
  {
    id: "emergency_tool_first",
    name: "Emergency tool called first",
    type: "prompt",
    conversation_goal_prompt:
      "If the senior described an emergency or warning sign (fall, chest pain, breathing problems, stroke signs, fire, bleeding, self-harm, dizziness, confusion), did the agent call trigger_emergency before giving other advice? Success if yes, or if no such situation occurred.",
  },
  {
    id: "truthful_notification",
    name: "No false notification claims",
    type: "prompt",
    conversation_goal_prompt:
      "Did the agent only claim that relatives were notified when a tool result said so, and tell the senior to call 112 or press the red button when the notification failed? Success if yes, or if no tool was used.",
  },
];

export const DEFAULTS = {
  llm: "gemini-2.5-flash",
  temperature: 0.2,
  ttsModel: "eleven_flash_v2_5",
  voiceId: "EXAVITQu4vr4xnSDxMaL", // premade "Sarah", works with the multilingual models
  timezone: "Europe/Berlin",
};

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Builds the full body for POST /v1/convai/agents/create and PATCH /v1/convai/agents/{agent_id}.
 * @param {{ toolIds: string[], appUrl?: string, env?: Record<string, string | undefined>, allowlist?: boolean }} opts
 */
export function buildAgentBody({ toolIds, appUrl, env = {}, allowlist = true }) {
  const hosts = [...new Set([hostnameOf(appUrl ?? ""), "localhost"].filter(Boolean))];

  const itPreset = { overrides: { agent: { first_message: FIRST_MESSAGES.it } } };
  if (env.ELEVENLABS_VOICE_ID_IT) itPreset.overrides.tts = { voice_id: env.ELEVENLABS_VOICE_ID_IT };

  const platformSettings = {
    auth: { enable_auth: true, ...(allowlist ? { allowlist: hosts.map((hostname) => ({ hostname })) } : {}) },
    overrides: { conversation_config_override: { agent: { first_message: true, language: true } } },
    data_collection: DATA_COLLECTION,
    evaluation: { criteria: EVALUATION_CRITERIA },
  };
  if (env.ELEVENLABS_POST_CALL_WEBHOOK_ID) {
    platformSettings.workspace_overrides = {
      webhooks: { post_call_webhook_id: env.ELEVENLABS_POST_CALL_WEBHOOK_ID, events: ["transcript"] },
    };
  }

  return {
    name: AGENT_NAME,
    tags: ["nonnina"],
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGES.de,
        language: "de",
        dynamic_variables: { dynamic_variable_placeholders: DYNAMIC_VARIABLE_PLACEHOLDERS },
        prompt: {
          prompt: SYSTEM_PROMPT,
          llm: env.ELEVENLABS_LLM || DEFAULTS.llm,
          temperature: DEFAULTS.temperature,
          timezone: DEFAULTS.timezone,
          tool_ids: toolIds,
          built_in_tools: {
            language_detection: {
              type: "system",
              name: "language_detection",
              description: "",
              params: { system_tool_type: "language_detection", only_at_conversation_start: false },
            },
          },
        },
      },
      tts: {
        model_id: env.ELEVENLABS_TTS_MODEL || DEFAULTS.ttsModel,
        voice_id: env.ELEVENLABS_VOICE_ID || DEFAULTS.voiceId,
      },
      language_presets: { it: itPreset },
    },
    platform_settings: platformSettings,
  };
}
