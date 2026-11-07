/**
 * Shared domain types. They mirror the Supabase schema in
 * supabase/migrations/0001_init.sql + 0002_escalation_and_auth.sql + 0003_help_request_acknowledge.sql one to one (snake_case on purpose),
 * so Layer 2 (family dashboard) and Layer 3 (marketplace) can reuse them.
 */
export type Language = "de" | "it";
export type Mood = "good" | "ok" | "low" | "worried";
export type HelpCategory = "daily_help" | "legal" | "money" | "health" | "loneliness" | "other";
export type HelpStatus = "open" | "ai_solved" | "escalated" | "matched";
export type EmergencyLevel = "emergency" | "warning";
export type EmergencySource = "agent_tool" | "keyword_detector" | "manual_button" | "no_response";
export type EmergencyStatus = "open" | "relatives_notified" | "acknowledged" | "cancelled_by_senior";
export type WaitlistRole = "family" | "helper" | "care_service" | "other";
export type NotificationChannel = "sms" | "call" | "email" | "demo";
export type HelperKind = "independent" | "service" | "volunteer";
export type HelperRequestStatus = "sent" | "accepted" | "declined" | "done";
/** Fixed list of marketplace services (helpers.services is checked against it in SQL). */
export const HELPER_SERVICES = [
  "shopping",
  "cooking",
  "company",
  "household",
  "transport",
  "appointments",
  "paperwork",
  "personal_care",
  "gardening",
  "tech_help",
] as const;
export type HelperService = (typeof HELPER_SERVICES)[number];

export interface Family {
  id: string;
  name: string;
  email: string | null;
  /** E.164. Called by the escalation ladder when no relative confirms. */
  fallback_phone: string | null;
  created_at: string;
}

export interface Relative {
  id: string;
  family_id: string;
  name: string;
  relation: string;
  phone: string | null;
  email: string | null;
  notify_sms: boolean;
  notify_call: boolean;
  priority: number;
  /** Supabase Auth user linked to this relative (null until they sign in). */
  user_id: string | null;
}

export interface MedicationTime {
  /** "HH:MM" 24h local time */
  time: string;
  label: string;
}

export interface Senior {
  id: string;
  family_id: string;
  first_name: string;
  language: Language;
  city: string;
  address_note: string | null;
  care_level: number;
  device_token: string;
  medication_times: MedicationTime[];
  created_at: string;
}

export interface SeniorContext {
  senior: Senior;
  family: Family;
  relatives: Relative[];
}

export interface VoiceSession {
  id: string;
  senior_id: string;
  conversation_id: string | null;
  summary: string | null;
  mood: Mood | null;
  problem_category: string | null;
  needs_human: boolean;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  senior_id: string;
  category: HelpCategory;
  summary: string;
  status: HelpStatus;
  resolved_at: string | null;
  /** Relative who pressed "I'm on it" in the feed (null = nobody yet). */
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface NotificationRecord {
  relative_id: string | null;
  name: string;
  channel: NotificationChannel;
  status: "sent" | "failed" | "demo" | "skipped";
  detail?: string;
  at: string;
}

export interface EmergencyEvent {
  id: string;
  senior_id: string;
  level: EmergencyLevel;
  reason: string;
  quote: string | null;
  source: EmergencySource;
  status: EmergencyStatus;
  notified: NotificationRecord[];
  /** Escalation ladder: how many steps have run and when the next one is due (null = ladder finished / not running). */
  escalation_step: number;
  next_step_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  role: WaitlistRole;
  city: string | null;
  message: string | null;
  created_at: string;
}

export interface FamilyFeed {
  family: Family;
  seniors: Senior[];
  events: EmergencyEvent[];
  helpRequests: HelpRequest[];
  sessions: VoiceSession[];
}

export interface FamilyOverview {
  family: Family;
  seniors: Senior[];
  relatives: Relative[];
}

/** A person, service or volunteer offering help (marketplace, Layer 3; supabase/migrations/0005_marketplace.sql). */
export interface Helper {
  id: string;
  /** Supabase Auth user who owns the profile (null for seeded / demo-mode profiles). */
  user_id: string | null;
  name: string;
  kind: HelperKind;
  city: string;
  bio: string;
  /** ISO 639-1 codes, e.g. ["de", "it"]. */
  languages: string[];
  services: HelperService[];
  /** null = free (volunteer). */
  hourly_rate_eur: number | null;
  /** Private: only the helper and families whose request the helper accepted see these. */
  phone: string | null;
  email: string | null;
  /** Set by a human on the Nonnina team, never automatically. */
  verified: boolean;
  active: boolean;
  /** Public profile photo: a path under /public (e.g. "/helpers/lucia-romano.jpg") or an absolute URL. null = initials. */
  photo_url: string | null;
  /** Seeded showcase profile (0006); the directory labels it "Demo profile". */
  is_demo: boolean;
  created_at: string;
}

/** What the public directory and GET /api/helpers may show (no contact data, no user id). */
export type PublicHelper = Omit<Helper, "user_id" | "phone" | "email">;

/** A family asks a helper for a service. */
export interface HelperRequest {
  id: string;
  family_id: string;
  senior_id: string;
  helper_id: string;
  /** The relative who sent it; their contact is revealed to the helper on accept. */
  relative_id: string | null;
  /** Optional link to the help request from the feed; set to "matched" on accept. */
  help_request_id: string | null;
  service: HelperService;
  message: string;
  preferred_time: string | null;
  status: HelperRequestStatus;
  /** SMS / email / demo records of the helper and family notifications. */
  notified: NotificationRecord[];
  created_at: string;
  updated_at: string;
}

export interface HelperFilter {
  service?: HelperService;
  /** Case-insensitive exact city match. */
  city?: string;
  language?: string;
  verifiedOnly?: boolean;
}

/** Inputs for creating rows (ids and timestamps are generated by the store). */
export type NewEmergencyEvent = Pick<EmergencyEvent, "senior_id" | "level" | "reason" | "quote" | "source">;
export type NewHelpRequest = Pick<HelpRequest, "senior_id" | "category" | "summary" | "status">;
export type NewFamily = Pick<Family, "name" | "email" | "fallback_phone">;
export type NewSenior = Omit<Senior, "id" | "created_at" | "device_token"> & { device_token?: string };
export type NewRelative = Omit<Relative, "id">;
export type NewVoiceSession = Omit<VoiceSession, "id" | "created_at">;
export type NewWaitlistEntry = Omit<WaitlistEntry, "id" | "created_at">;
export type NewHelper = Omit<Helper, "id" | "created_at" | "verified" | "active" | "photo_url" | "is_demo"> & {
  verified?: boolean;
  active?: boolean;
  photo_url?: string | null;
  is_demo?: boolean;
};
export type NewHelperRequest = Omit<HelperRequest, "id" | "created_at" | "updated_at" | "status" | "notified">;
