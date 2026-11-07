import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmergencyEventPatch, HelpRequestPatch, Store } from "./store";
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

const newDeviceToken = () => randomBytes(12).toString("hex");

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

  async updateEmergencyEvent(id: string, patch: EmergencyEventPatch): Promise<EmergencyEvent | null> {
    const { data, error } = await this.db
      .from("emergency_events")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) fail("emergency_events.update", error);
    return (data as EmergencyEvent) ?? null;
  }

  async findEventsDueForEscalation(now: Date, limit = 20): Promise<EmergencyEvent[]> {
    const { data, error } = await this.db
      .from("emergency_events")
      .select("*")
      .eq("level", "emergency")
      .in("status", ["open", "relatives_notified"])
      .not("next_step_at", "is", null)
      .lte("next_step_at", now.toISOString())
      .order("next_step_at", { ascending: true })
      .limit(limit);
    if (error) fail("emergency_events.due", error);
    return (data ?? []) as EmergencyEvent[];
  }

  async getRelative(id: string): Promise<Relative | null> {
    const { data, error } = await this.db.from("relatives").select("*").eq("id", id).maybeSingle();
    if (error) fail("relatives.get", error);
    return (data as Relative) ?? null;
  }

  async createHelpRequest(input: NewHelpRequest): Promise<HelpRequest> {
    const { data, error } = await this.db.from("help_requests").insert(input).select("*").single();
    if (error) fail("help_requests.insert", error);
    return data as HelpRequest;
  }

  async updateHelpRequest(id: string, patch: HelpRequestPatch): Promise<HelpRequest | null> {
    const { data, error } = await this.db.from("help_requests").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) fail("help_requests.update", error);
    return (data as HelpRequest) ?? null;
  }

  async createVoiceSession(input: NewVoiceSession): Promise<VoiceSession> {
    const { data, error } = await this.db.from("voice_sessions").insert(input).select("*").single();
    if (error) fail("voice_sessions.insert", error);
    return data as VoiceSession;
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

  // ---------- family management ----------

  async createFamily(input: NewFamily): Promise<Family> {
    const { data, error } = await this.db.from("families").insert(input).select("*").single();
    if (error) fail("families.insert", error);
    return data as Family;
  }

  async updateFamily(id: string, patch: Partial<NewFamily>): Promise<Family | null> {
    const { data, error } = await this.db.from("families").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) fail("families.update", error);
    return (data as Family) ?? null;
  }

  async createSenior(input: NewSenior): Promise<Senior> {
    // Without device_token the DB default generates one.
    const row: Record<string, unknown> = { ...input };
    if (!row.device_token) delete row.device_token;
    const { data, error } = await this.db.from("seniors").insert(row).select("*").single();
    if (error) fail("seniors.insert", error);
    return data as Senior;
  }

  async updateSenior(id: string, patch: Partial<Omit<NewSenior, "family_id">>): Promise<Senior | null> {
    const { data, error } = await this.db.from("seniors").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) fail("seniors.update", error);
    return (data as Senior) ?? null;
  }

  async rotateDeviceToken(seniorId: string): Promise<Senior | null> {
    return this.updateSenior(seniorId, { device_token: newDeviceToken() });
  }

  async createRelative(input: NewRelative): Promise<Relative> {
    const { data, error } = await this.db.from("relatives").insert(input).select("*").single();
    if (error) fail("relatives.insert", error);
    return data as Relative;
  }

  async updateRelative(id: string, patch: Partial<Omit<NewRelative, "family_id">>): Promise<Relative | null> {
    const { data, error } = await this.db.from("relatives").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) fail("relatives.update", error);
    return (data as Relative) ?? null;
  }

  async deleteRelative(id: string): Promise<void> {
    const { error } = await this.db.from("relatives").delete().eq("id", id);
    if (error) fail("relatives.delete", error);
  }

  private async overviewFor(family: Family): Promise<FamilyOverview> {
    const [{ data: seniors, error: sErr }, { data: relatives, error: rErr }] = await Promise.all([
      this.db.from("seniors").select("*").eq("family_id", family.id).order("created_at"),
      this.db.from("relatives").select("*").eq("family_id", family.id).order("priority"),
    ]);
    if (sErr) fail("seniors.byFamily", sErr);
    if (rErr) fail("relatives.byFamily", rErr);
    return { family, seniors: (seniors ?? []) as Senior[], relatives: (relatives ?? []) as Relative[] };
  }

  async getFamilyForUser(userId: string): Promise<FamilyOverview | null> {
    const { data: rel, error: rErr } = await this.db
      .from("relatives")
      .select("family_id")
      .eq("user_id", userId)
      .order("priority")
      .limit(1)
      .maybeSingle();
    if (rErr) fail("relatives.byUser", rErr);
    if (!rel) return null;
    return this.getFamilyOverview((rel as { family_id: string }).family_id);
  }

  async getFamilyOverview(familyId: string): Promise<FamilyOverview | null> {
    const { data: family, error } = await this.db.from("families").select("*").eq("id", familyId).maybeSingle();
    if (error) fail("families.get", error);
    if (!family) return null;
    return this.overviewFor(family as Family);
  }

  async linkRelativeToUser(relativeId: string, userId: string): Promise<Relative | null> {
    return this.updateRelative(relativeId, { user_id: userId });
  }
}
