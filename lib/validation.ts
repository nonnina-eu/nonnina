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
});

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
