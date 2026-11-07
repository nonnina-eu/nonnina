import type {
  EmergencyEvent,
  Family,
  FamilyFeed,
  FamilyOverview,
  HelpRequest,
  NewEmergencyEvent,
  NewFamily,
  NewHelpRequest,
  NewRelative,
  NewSenior,
  NewVoiceSession,
  Relative,
  Senior,
  SeniorContext,
  VoiceSession,
} from "./types";

export type EmergencyEventPatch = Partial<
  Pick<EmergencyEvent, "status" | "notified" | "escalation_step" | "next_step_at" | "acknowledged_by">
>;
export type HelpRequestPatch = Partial<Pick<HelpRequest, "status" | "resolved_at" | "acknowledged_by" | "acknowledged_at">>;

/**
 * Storage port. Two adapters implement it:
 *  - SupabaseStore (production, service role, RLS enabled)
 *  - MemoryStore   (demo mode when no Supabase keys exist, seeded with Maria)
 */
export interface Store {
  readonly kind: "supabase" | "memory";

  getSeniorByToken(token: string): Promise<SeniorContext | null>;
  getSeniorById(id: string): Promise<SeniorContext | null>;

  createEmergencyEvent(input: NewEmergencyEvent): Promise<EmergencyEvent>;
  getEmergencyEvent(id: string): Promise<EmergencyEvent | null>;
  /** Latest event for the senior that is still "live" (not cancelled), created after `since`. */
  findRecentEmergency(seniorId: string, since: Date): Promise<EmergencyEvent | null>;
  updateEmergencyEvent(id: string, patch: EmergencyEventPatch): Promise<EmergencyEvent | null>;
  /** Live emergency-level events whose next_step_at <= now (status open or relatives_notified). Oldest first. */
  findEventsDueForEscalation(now: Date, limit?: number): Promise<EmergencyEvent[]>;

  getRelative(id: string): Promise<Relative | null>;

  createHelpRequest(input: NewHelpRequest): Promise<HelpRequest>;
  updateHelpRequest(id: string, patch: HelpRequestPatch): Promise<HelpRequest | null>;
  /** Latest help request of the senior that a relative took ("I'm on it") after `since` and nobody marked done yet. */
  findAcknowledgedHelpRequest(seniorId: string, since: Date): Promise<HelpRequest | null>;
  createVoiceSession(input: NewVoiceSession): Promise<VoiceSession>;

  getFamilyFeed(familyId: string, limit?: number): Promise<FamilyFeed | null>;
  resetDemoData(familyId: string): Promise<void>;

  // ---------- family management (onboarding + settings) ----------
  createFamily(input: NewFamily): Promise<Family>;
  updateFamily(id: string, patch: Partial<NewFamily>): Promise<Family | null>;
  createSenior(input: NewSenior): Promise<Senior>;
  updateSenior(id: string, patch: Partial<Omit<NewSenior, "family_id">>): Promise<Senior | null>;
  /** Issues a fresh device token (new QR code); the old token stops resolving. */
  rotateDeviceToken(seniorId: string): Promise<Senior | null>;
  createRelative(input: NewRelative): Promise<Relative>;
  updateRelative(id: string, patch: Partial<Omit<NewRelative, "family_id">>): Promise<Relative | null>;
  deleteRelative(id: string): Promise<void>;
  /** The family (first one) where a relative row has this auth user id. */
  getFamilyForUser(userId: string): Promise<FamilyOverview | null>;
  getFamilyOverview(familyId: string): Promise<FamilyOverview | null>;
  linkRelativeToUser(relativeId: string, userId: string): Promise<Relative | null>;
}
