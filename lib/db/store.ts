import type {
  EmergencyEvent,
  EmergencyStatus,
  FamilyFeed,
  HelpRequest,
  NewEmergencyEvent,
  NewHelpRequest,
  NewVoiceSession,
  NewWaitlistEntry,
  NotificationRecord,
  SeniorContext,
  VoiceSession,
} from "./types";

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
  updateEmergencyEvent(
    id: string,
    patch: Partial<{ status: EmergencyStatus; notified: NotificationRecord[] }>,
  ): Promise<EmergencyEvent | null>;

  createHelpRequest(input: NewHelpRequest): Promise<HelpRequest>;
  createVoiceSession(input: NewVoiceSession): Promise<VoiceSession>;

  addToWaitlist(input: NewWaitlistEntry): Promise<{ created: boolean }>;

  getFamilyFeed(familyId: string, limit?: number): Promise<FamilyFeed | null>;
  resetDemoData(familyId: string): Promise<void>;
}
