import { z } from "zod";
import { HELPER_SERVICES } from "@/lib/db/types";
import { HELPER_LANGUAGES } from "@/lib/marketplace";

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

// ---------- marketplace (helpers + helper requests) ----------

export const helperServiceSchema = z.enum(HELPER_SERVICES);
export const helperKindSchema = z.enum(["independent", "service", "volunteer"]);

/** "" / undefined → null; "18,50" → 18.5. Non-numbers become NaN so the number check fails. */
const optionalRate = z.preprocess((v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(",", ".");
  return s === "" ? null : Number(s);
}, z.number().min(5).max(150).nullable());

const helperProfileObject = z.object({
  name: z.string().trim().min(2).max(80),
  kind: helperKindSchema,
  city: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(20).max(800),
  languages: z.array(z.enum(HELPER_LANGUAGES)).min(1).max(8),
  services: z.array(helperServiceSchema).min(1).max(10),
  /** "I help for free" */
  free: z.boolean().default(false),
  hourly_rate_eur: optionalRate,
  phone: phoneE164,
  email: z.string().trim().email().max(120),
  consent_share: z.boolean().default(false),
  consent_verify: z.boolean().default(false),
});

/**
 * Helper profile (sign-up and edit). Volunteers and "free" helpers have no rate; everyone
 * else needs one. Sign-up additionally needs both consent boxes.
 */
export function helperProfileSchema(options: { requireConsent: boolean } = { requireConsent: true }) {
  return helperProfileObject
    .superRefine((v, ctx) => {
      const free = v.free || v.kind === "volunteer";
      if (!free && v.hourly_rate_eur === null) ctx.addIssue({ code: "custom", path: ["hourly_rate_eur"], message: "Enter an hourly rate or tick “I help for free”." });
      if (options.requireConsent && !v.consent_share) ctx.addIssue({ code: "custom", path: ["consent_share"], message: "Please confirm." });
      if (options.requireConsent && !v.consent_verify) ctx.addIssue({ code: "custom", path: ["consent_verify"], message: "Please confirm." });
    })
    .transform((v) => ({
      name: v.name,
      kind: v.kind,
      city: v.city,
      bio: v.bio,
      languages: [...new Set(v.languages)] as string[],
      services: [...new Set(v.services)],
      hourly_rate_eur: v.free || v.kind === "volunteer" ? null : v.hourly_rate_eur,
      phone: v.phone,
      email: v.email.toLowerCase(),
    }));
}
export type HelperProfileInput = z.infer<ReturnType<typeof helperProfileSchema>>;

/** A family member asks a helper (form on /helpers/[id]). */
export const helperRequestFormSchema = z.object({
  helper_id: z.string().uuid(),
  senior_id: z.string().uuid(),
  service: helperServiceSchema,
  message: z.string().trim().min(5).max(600),
  preferred_time: z
    .union([z.string().trim().max(120), z.undefined(), z.null()])
    .transform((v) => (v ? v : null)),
  help_request_id: z
    .union([z.string().uuid(), z.literal(""), z.undefined(), z.null()])
    .transform((v) => (v ? v : null)),
});
export type HelperRequestFormInput = z.infer<typeof helperRequestFormSchema>;

/** "2,5" → 2.5; "" / undefined → null; non-numbers → NaN (fails the number check). */
function decimal(v: unknown): number | null {
  if (v === undefined || v === null) return null;
  const str = String(v).trim().replace(",", ".");
  return str === "" ? null : Number(str);
}

/**
 * Recording a finished job (helper on /helpers/me or family on /app). amount_eur empty →
 * null: the server then uses hours × hourly rate (0 for free helpers). The service date may
 * not lie in the future (`today` = "YYYY-MM-DD" in Europe/Berlin, passed by the caller).
 */
export function completeJobSchema(today: string) {
  return z.object({
    request_id: z.string().uuid(),
    service_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
      .refine((d) => !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime()) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d), "Invalid date")
      .refine((d) => d <= today, "The date cannot be in the future")
      .refine((d) => d >= "2024-01-01", "Date too far in the past"),
    hours: z.preprocess(decimal, z.number().min(0.25).max(24)),
    amount_eur: z.preprocess(decimal, z.number().min(0).max(5000).nullable()),
  });
}
export type CompleteJobInput = z.infer<ReturnType<typeof completeJobSchema>>;

/** The "Record as done" form (helper on /helpers/me, family on /app). */
export function parseCompletionForm(formData: FormData, today: string) {
  const get = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : undefined;
  };
  return completeJobSchema(today).safeParse({
    request_id: get("request_id"),
    service_date: get("service_date"),
    hours: get("hours"),
    amount_eur: get("amount_eur"),
  });
}

/** GET /api/helpers query. */
export const helperQuerySchema = z.object({
  service: helperServiceSchema.optional(),
  city: z.string().trim().min(1).max(80).optional(),
  language: z.enum(HELPER_LANGUAGES).optional(),
  verified: z.enum(["1", "true", "0", "false"]).optional(),
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

// ---------- landing page waitlist ----------

export const waitlistRoleSchema = z.enum(["family", "helper", "care_service", "other"]);

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  role: waitlistRoleSchema,
  city: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().max(1000).optional().default(""),
  /** honeypot: real users never see it; bots that fill it get a silent success */
  hp_field: z.string().max(500).optional().default(""),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;
