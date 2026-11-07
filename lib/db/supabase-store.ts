import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Store } from "./store";
import type {
  EmergencyEvent,
  EmergencyStatus,
  Family,
  FamilyFeed,
  HelpRequest,
  NewEmergencyEvent,
  NewHelpRequest,
  NewVoiceSession,
  NewWaitlistEntry,
  NotificationRecord,
  Relative,
  Senior,
  SeniorContext,
  VoiceSession,
} from "./types";

function fail(where: string, error: { message: string } | null): never {
  throw new Error(`[supabase] ${where}: ${error?.message ?? "unknown error"}`);
}

export class SupabaseStore implements Store {
  readonly kind = "supabase" as const;
  private readonly db: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.db = client ?? createAdminClient();
  }

  private async contextFor(senior: Senior): Promise<SeniorContext | null> {
    const [{ data: family, error: fErr }, { data: relatives, error: rErr }] = await Promise.all([
      this.db.from("families").select("*").eq("id", senior.family_id).maybeSingle(),
      this.db.from("relatives").select("*").eq("family_id", senior.family_id).order("priority"),
    ]);
    if (fErr) fail("families.select", fErr);
    if (rErr) fail("relatives.select", rErr);
    if (!family) return null;
    return { senior, family: family as Family, relatives: (relatives ?? []) as Relative[] };
  }

  async getSeniorByToken(token: string): Promise<SeniorContext | null> {
    const { data, error } = await this.db.from("seniors").select("*").eq("device_token", token).maybeSingle();
    if (error) fail("seniors.byToken", error);
    return data ? this.contextFor(data as Senior) : null;
  }

  async getSeniorById(id: string): Promise<SeniorContext | null> {
    const { data, error } = await this.db.from("seniors").select("*").eq("id", id).maybeSingle();
    if (error) fail("seniors.byId", error);
    return data ? this.contextFor(data as Senior) : null;
  }

  async createEmergencyEvent(input: NewEmergencyEvent): Promise<EmergencyEvent> {
    const { data, error } = await this.db
      .from("emergency_events")
      .insert({ ...input, status: "open", notified: [] })
      .select("*")
      .single();
    if (error) fail("emergency_events.insert", error);
    return data as EmergencyEvent;
  }

  async getEmergencyEvent(id: string): Promise<EmergencyEvent | null> {
    const { data, error } = await this.db.from("emergency_events").select("*").eq("id", id).maybeSingle();
    if (error) fail("emergency_events.get", error);
    return (data as EmergencyEvent) ?? null;
  }

  async findRecentEmergency(seniorId: string, since: Date): Promise<EmergencyEvent | null> {
    const { data, error } = await this.db
      .from("emergency_events")
      .select("*")
      .eq("senior_id", seniorId)
      .neq("status", "cancelled_by_senior")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) fail("emergency_events.recent", error);
    return (data as EmergencyEvent) ?? null;
  }

  async updateEmergencyEvent(
    id: string,
    patch: Partial<{ status: EmergencyStatus; notified: NotificationRecord[] }>,
  ): Promise<EmergencyEvent | null> {
    const { data, error } = await this.db
      .from("emergency_events")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) fail("emergency_events.update", error);
    return (data as EmergencyEvent) ?? null;
  }

  async createHelpRequest(input: NewHelpRequest): Promise<HelpRequest> {
    const { data, error } = await this.db.from("help_requests").insert(input).select("*").single();
    if (error) fail("help_requests.insert", error);
    return data as HelpRequest;
  }

  async createVoiceSession(input: NewVoiceSession): Promise<VoiceSession> {
    const { data, error } = await this.db.from("voice_sessions").insert(input).select("*").single();
    if (error) fail("voice_sessions.insert", error);
    return data as VoiceSession;
  }

  async addToWaitlist(input: NewWaitlistEntry): Promise<{ created: boolean }> {
    const { error } = await this.db.from("waitlist").insert({ ...input, email: input.email.toLowerCase() });
    if (error) {
      if (error.code === "23505") return { created: false }; // unique_violation
      fail("waitlist.insert", error);
    }
    return { created: true };
  }

  async getFamilyFeed(familyId: string, limit = 50): Promise<FamilyFeed | null> {
    const { data: family, error: fErr } = await this.db.from("families").select("*").eq("id", familyId).maybeSingle();
    if (fErr) fail("families.get", fErr);
    if (!family) return null;

    const { data: seniors, error: sErr } = await this.db.from("seniors").select("*").eq("family_id", familyId);
    if (sErr) fail("seniors.byFamily", sErr);
    const ids = (seniors ?? []).map((s) => (s as Senior).id);
    if (ids.length === 0) {
      return { family: family as Family, seniors: [], events: [], helpRequests: [], sessions: [] };
    }

    const [ev, hr, vs] = await Promise.all([
      this.db.from("emergency_events").select("*").in("senior_id", ids).order("created_at", { ascending: false }).limit(limit),
      this.db.from("help_requests").select("*").in("senior_id", ids).order("created_at", { ascending: false }).limit(limit),
      this.db.from("voice_sessions").select("*").in("senior_id", ids).order("created_at", { ascending: false }).limit(limit),
    ]);
    if (ev.error) fail("emergency_events.list", ev.error);
    if (hr.error) fail("help_requests.list", hr.error);
    if (vs.error) fail("voice_sessions.list", vs.error);

    return {
      family: family as Family,
      seniors: (seniors ?? []) as Senior[],
      events: (ev.data ?? []) as EmergencyEvent[],
      helpRequests: (hr.data ?? []) as HelpRequest[],
      sessions: (vs.data ?? []) as VoiceSession[],
    };
  }

  async resetDemoData(familyId: string): Promise<void> {
    const { data: seniors } = await this.db.from("seniors").select("id").eq("family_id", familyId);
    const ids = (seniors ?? []).map((s) => (s as { id: string }).id);
    if (ids.length === 0) return;
    await Promise.all([
      this.db.from("emergency_events").delete().in("senior_id", ids),
      this.db.from("help_requests").delete().in("senior_id", ids),
      this.db.from("voice_sessions").delete().in("senior_id", ids),
    ]);
  }
}
