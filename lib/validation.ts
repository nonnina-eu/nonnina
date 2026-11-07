import { z } from "zod";

export const emergencyLevelSchema = z.enum(["emergency", "warning"]);
export const emergencySourceSchema = z.enum(["agent_tool", "keyword_detector", "manual_button", "no_response"]);
export const helpCategorySchema = z.enum(["daily_help", "legal", "money", "health", "loneliness", "other"]);

export const emergencyRequestSchema = z.object({
  token: z.string().min(3).max(120),
  level: emergencyLevelSchema,
  reason: z.string().trim().min(1).max(300),
  quote: z.string().trim().max(600).optional().default(""),
  source: emergencySourceSchema,
});
export type EmergencyRequest = z.infer<typeof emergencyRequestSchema>;

export const emergencyUpdateSchema = z.object({
  action: z.enum(["acknowledge", "cancel"]),
  /** required for "cancel" (the senior's device), ignored for "acknowledge" */
  token: z.string().min(3).max(120).optional(),
  /** optional for "acknowledge": which relative pressed "I'm on it" */
  relative_id: z.string().uuid().optional(),
});
export type EmergencyUpdate = z.infer<typeof emergencyUpdateSchema>;

export const helpRequestUpdateSchema = z.object({
  /** "acknowledge" = a relative pressed "I'm on it"; the senior tablet then shows "Anna kümmert sich um: …". */
  action: z.enum(["resolve", "reopen", "acknowledge"]),
  /** optional for "acknowledge" without a session (demo page): which relative takes it */
  relative_id: z.string().uuid().optional(),
});
export type HelpRequestUpdate = z.infer<typeof helpRequestUpdateSchema>;

// ---------- family onboarding + settings ----------

export const phoneE164 = z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/, "Use the international format, e.g. +49 151 ... without spaces");

/** Optional phone: empty string or undefined → null. */
const optionalPhone = z
  .union([phoneE164, z.literal(""), z.undefined(), z.null()])
  .transform((v) => (v ? v : null));

/** Optional email: empty string → null. */
const optionalEmail = z
  .union([z.string().trim().email().max(120), z.literal(""), z.undefined(), z.null()])
  .transform((v) => (v ? v : null));

export const familySetupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: optionalEmail,
  fallback_phone: optionalPhone,
});
export type FamilySetupInput = z.infer<typeof familySetupSchema>;

export const medicationTimeSchema = z.object({
  time: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM"),
  label: z.string().trim().min(1).max(60),
});

export const seniorSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  language: z.enum(["de", "it"]),
  city: z.string().trim().min(1).max(80),
  address_note: z
    .union([z.string().trim().max(200), z.literal(""), z.undefined(), z.null()])
    .transform((v) => (v ? v : null)),
  care_level: z.coerce.number().int().min(0).max(5),
  medication_times: z.array(medicationTimeSchema).max(8).default([]),
});
export type SeniorInput = z.infer<typeof seniorSchema>;

export const relativeSchema = z.object({
  name: z.string().trim().min(1).max(60),
  relation: z.string().trim().min(1).max(40),
  phone: phoneE164,
  email: optionalEmail,
  notify_sms: z.boolean().default(true),
  notify_call: z.boolean().default(false),
  priority: z.coerce.number().int().min(1).max(10),
});
export type RelativeInput = z.infer<typeof relativeSchema>;

export const helpRequestSchema = z.object({
  token: z.string().min(3).max(120),
  category: helpCategorySchema,
  summary: z.string().trim().min(1).max(500),
});

export const signedUrlSchema = z.object({
  token: z.string().min(3).max(120),
});

/** ElevenLabs post-call webhook payload (only the fields we consume). */
export const postCallWebhookSchema = z.object({
  type: z.string().optional(),
  data: z.object({
    agent_id: z.string().optional(),
    conversation_id: z.string(),
    conversation_initiation_client_data: z
      .object({
        dynamic_variables: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    analysis: z
      .object({
        transcript_summary: z.string().optional(),
        data_collection_results: z
          .record(
            z.string(),
            z.object({
              value: z.unknown().optional(),
              rationale: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    transcript: z
      .array(
        z.object({
          role: z.string(),
          message: z.string().nullable().optional(),
        }),
      )
      .optional(),
  }),
});
