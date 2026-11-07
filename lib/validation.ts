import { z } from "zod";

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
