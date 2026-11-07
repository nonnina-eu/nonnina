import { randomBytes, randomUUID } from "node:crypto";
import type { EmergencyEventPatch, HelpRequestPatch, Store } from "./store";
import type { HelperPatch, HelperRequestPatch } from "./store";
import type { Helper, HelperFilter, HelperRequest, NewHelper, NewHelperRequest, PublicHelper } from "./types";
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
import { demoFamily, demoRelatives, demoSeniors } from "./seed";
import { demoHelperRequests, demoHelpers } from "./seed";
import { compareHelpers, matchesHelperFilter, toPublicHelper } from "@/lib/marketplace";

interface MemoryState {
  families: Family[];
  seniors: Senior[];
  relatives: Relative[];
  events: EmergencyEvent[];
  helpRequests: HelpRequest[];
  sessions: VoiceSession[];
}

const g = globalThis as unknown as { __careCopilotMemory?: MemoryState };

function state(): MemoryState {
  if (!g.__careCopilotMemory) {
    g.__careCopilotMemory = {
      families: [demoFamily()],
      seniors: demoSeniors(),
      relatives: demoRelatives(),
      events: [],
      helpRequests: [],
      sessions: [],
    };
  }
  return g.__careCopilotMemory;
}

const now = () => new Date().toISOString();
export const newDeviceToken = () => randomBytes(12).toString("hex");

const LIVE_STATUSES: ReadonlySet<EmergencyEvent["status"]> = new Set(["open", "relatives_notified"]);

function context(s: MemoryState, senior: Senior): SeniorContext | null {
  const family = s.families.find((f) => f.id === senior.family_id);
  if (!family) return null;
  const relatives = s.relatives
    .filter((r) => r.family_id === family.id)
    .sort((a, b) => a.priority - b.priority);
  return { senior, family, relatives };
}

function overview(s: MemoryState, family: Family): FamilyOverview {
  return {
    family,
    seniors: s.seniors.filter((x) => x.family_id === family.id),
    relatives: s.relatives.filter((r) => r.family_id === family.id).sort((a, b) => a.priority - b.priority),
  };
}

/**
 * In-memory adapter. Survives hot reloads via globalThis; resets on a cold start.
 * Good enough for demos and local development without Supabase.
 */
export class MemoryStore implements Store {
  readonly kind = "memory" as const;

  async getSeniorByToken(token: string): Promise<SeniorContext | null> {
    const s = state();
    const senior = s.seniors.find((x) => x.device_token === token);
    return senior ? context(s, senior) : null;
  }

  async getSeniorById(id: string): Promise<SeniorContext | null> {
    const s = state();
    const senior = s.seniors.find((x) => x.id === id);
    return senior ? context(s, senior) : null;
  }

  async createEmergencyEvent(input: NewEmergencyEvent): Promise<EmergencyEvent> {
    const ts = now();
    const event: EmergencyEvent = {
      id: randomUUID(),
      ...input,
      status: "open",
      notified: [],
      escalation_step: 0,
      next_step_at: null,
      acknowledged_by: null,
      created_at: ts,
      updated_at: ts,
    };
    state().events.unshift(event);
    return event;
  }

  async claimEmergencyEvent(input: NewEmergencyEvent, since: Date): Promise<{ event: EmergencyEvent; created: boolean }> {
    // No await between the read and the insert: one Node process cannot open two events for the same tap.
    const recent =
      state().events.find(
        (e) =>
          e.senior_id === input.senior_id &&
          e.status !== "cancelled_by_senior" &&
          new Date(e.created_at).getTime() >= since.getTime(),
      ) ?? null;
    if (recent && (recent.level === input.level || recent.level === "emergency")) {
      return { event: recent, created: false };
    }
    const event = await this.createEmergencyEvent(input);
    return { event, created: true };
  }

  async getEmergencyEvent(id: string): Promise<EmergencyEvent | null> {
    return state().events.find((e) => e.id === id) ?? null;
  }

  async findRecentEmergency(seniorId: string, since: Date): Promise<EmergencyEvent | null> {
    return (
      state().events.find(
        (e) =>
          e.senior_id === seniorId &&
          e.status !== "cancelled_by_senior" &&
          new Date(e.created_at).getTime() >= since.getTime(),
      ) ?? null
    );
  }

  async updateEmergencyEvent(id: string, patch: EmergencyEventPatch): Promise<EmergencyEvent | null> {
    const event = state().events.find((e) => e.id === id);
    if (!event) return null;
    Object.assign(event, patch, { updated_at: now() });
    return event;
  }

  async findEventsDueForEscalation(at: Date, limit = 20): Promise<EmergencyEvent[]> {
    const t = at.getTime();
    return state()
      .events.filter(
        (e) =>
          e.level === "emergency" &&
          LIVE_STATUSES.has(e.status) &&
          e.next_step_at !== null &&
          new Date(e.next_step_at).getTime() <= t,
      )
      .sort((a, b) => new Date(a.next_step_at!).getTime() - new Date(b.next_step_at!).getTime())
      .slice(0, limit);
  }

  async getRelative(id: string): Promise<Relative | null> {
    return state().relatives.find((r) => r.id === id) ?? null;
  }

  async createHelpRequest(input: NewHelpRequest): Promise<HelpRequest> {
    const req: HelpRequest = { id: randomUUID(), ...input, resolved_at: null, acknowledged_by: null, acknowledged_at: null, created_at: now() };
    state().helpRequests.unshift(req);
    return req;
  }

  async updateHelpRequest(id: string, patch: HelpRequestPatch): Promise<HelpRequest | null> {
    const req = state().helpRequests.find((h) => h.id === id);
    if (!req) return null;
    Object.assign(req, patch);
    return req;
  }

  async findAcknowledgedHelpRequest(seniorId: string, since: Date): Promise<HelpRequest | null> {
    const t = since.getTime();
    return (
      state()
        .helpRequests.filter(
          (h) => h.senior_id === seniorId && h.acknowledged_at !== null && h.resolved_at === null && new Date(h.acknowledged_at).getTime() >= t,
        )
        .sort((a, b) => new Date(b.acknowledged_at!).getTime() - new Date(a.acknowledged_at!).getTime())[0] ?? null
    );
  }

  async createVoiceSession(input: NewVoiceSession): Promise<{ session: VoiceSession; created: boolean }> {
    if (input.conversation_id) {
      const existing = state().sessions.find((v) => v.conversation_id === input.conversation_id);
      if (existing) return { session: existing, created: false };
    }
    const session: VoiceSession = { id: randomUUID(), ...input, created_at: now() };
    state().sessions.unshift(session);
    return { session, created: true };
  }

  async getFamilyFeed(familyId: string, limit = 50): Promise<FamilyFeed | null> {
    const s = state();
    const family = s.families.find((f) => f.id === familyId);
    if (!family) return null;
    const seniors = s.seniors.filter((x) => x.family_id === familyId);
    const seniorIds = new Set(seniors.map((x) => x.id));
    return {
      family,
      seniors,
      events: s.events.filter((e) => seniorIds.has(e.senior_id)).slice(0, limit),
      helpRequests: s.helpRequests.filter((h) => seniorIds.has(h.senior_id)).slice(0, limit),
      sessions: s.sessions.filter((v) => seniorIds.has(v.senior_id)).slice(0, limit),
    };
  }

  async resetDemoData(familyId: string): Promise<void> {
    const s = state();
    const seniorIds = new Set(s.seniors.filter((x) => x.family_id === familyId).map((x) => x.id));
    s.events = s.events.filter((e) => !seniorIds.has(e.senior_id));
    s.helpRequests = s.helpRequests.filter((h) => !seniorIds.has(h.senior_id));
    s.sessions = s.sessions.filter((v) => !seniorIds.has(v.senior_id));
  }

  // ---------- family management ----------

  async createFamily(input: NewFamily): Promise<Family> {
    const family: Family = { id: randomUUID(), ...input, created_at: now() };
    state().families.push(family);
    return family;
  }

  async updateFamily(id: string, patch: Partial<NewFamily>): Promise<Family | null> {
    const family = state().families.find((f) => f.id === id);
    if (!family) return null;
    Object.assign(family, patch);
    return family;
  }

  async createSenior(input: NewSenior): Promise<Senior> {
    const { device_token, ...rest } = input;
    const senior: Senior = { id: randomUUID(), ...rest, device_token: device_token ?? newDeviceToken(), created_at: now() };
    state().seniors.push(senior);
    return senior;
  }

  async updateSenior(id: string, patch: Partial<Omit<NewSenior, "family_id">>): Promise<Senior | null> {
    const senior = state().seniors.find((x) => x.id === id);
    if (!senior) return null;
    Object.assign(senior, patch);
    return senior;
  }

  async rotateDeviceToken(seniorId: string): Promise<Senior | null> {
    const senior = state().seniors.find((x) => x.id === seniorId);
    if (!senior) return null;
    senior.device_token = newDeviceToken();
    return senior;
  }

  async createRelative(input: NewRelative): Promise<Relative> {
    const relative: Relative = { id: randomUUID(), ...input };
    state().relatives.push(relative);
    return relative;
  }

  async updateRelative(id: string, patch: Partial<Omit<NewRelative, "family_id">>): Promise<Relative | null> {
    const relative = state().relatives.find((r) => r.id === id);
    if (!relative) return null;
    Object.assign(relative, patch);
    return relative;
  }

  async deleteRelative(id: string): Promise<void> {
    const s = state();
    s.relatives = s.relatives.filter((r) => r.id !== id);
  }

  async getFamilyForUser(userId: string): Promise<FamilyOverview | null> {
    const s = state();
    const relative = s.relatives.find((r) => r.user_id === userId);
    if (!relative) return null;
    const family = s.families.find((f) => f.id === relative.family_id);
    return family ? overview(s, family) : null;
  }

  async getFamilyOverview(familyId: string): Promise<FamilyOverview | null> {
    const s = state();
    const family = s.families.find((f) => f.id === familyId);
    return family ? overview(s, family) : null;
  }

  async linkRelativeToUser(relativeId: string, userId: string): Promise<Relative | null> {
    const relative = state().relatives.find((r) => r.id === relativeId);
    if (!relative) return null;
    relative.user_id = userId;
    return relative;
  }

  // ---------- marketplace ----------
  // Separate global from the family state, so tests that reset __careCopilotMemory keep working
  // and the marketplace can be reset on its own (__nonninaMarketplace).

  async listHelpers(filter: HelperFilter = {}): Promise<PublicHelper[]> {
    return market()
      .helpers.filter((h) => matchesHelperFilter(h, filter))
      .sort(compareHelpers)
      .map(toPublicHelper);
  }

  async getHelper(id: string): Promise<Helper | null> {
    return market().helpers.find((h) => h.id === id) ?? null;
  }

  async getHelperByUserId(userId: string): Promise<Helper | null> {
    return market().helpers.find((h) => h.user_id === userId) ?? null;
  }

  async createHelper(input: NewHelper): Promise<Helper> {
    const helper: Helper = {
      id: randomUUID(),
      ...input,
      verified: input.verified ?? false,
      active: input.active ?? true,
      photo_url: input.photo_url ?? null,
      is_demo: input.is_demo ?? false,
      relief_eligible: input.relief_eligible ?? false,
      created_at: now(),
    };
    market().helpers.push(helper);
    return helper;
  }

  async updateHelper(id: string, patch: HelperPatch): Promise<Helper | null> {
    const helper = market().helpers.find((h) => h.id === id);
    if (!helper) return null;
    Object.assign(helper, patch);
    return helper;
  }

  async createHelperRequest(input: NewHelperRequest): Promise<HelperRequest> {
    const ts = now();
    const req: HelperRequest = {
      id: randomUUID(),
      ...input,
      status: "sent",
      notified: [],
      hours: null,
      amount_eur: null,
      service_date: null,
      completed_at: null,
      created_at: ts,
      updated_at: ts,
    };
    market().helperRequests.unshift(req);
    return req;
  }

  async getHelperRequest(id: string): Promise<HelperRequest | null> {
    return market().helperRequests.find((r) => r.id === id) ?? null;
  }

  async updateHelperRequest(id: string, patch: HelperRequestPatch): Promise<HelperRequest | null> {
    const req = market().helperRequests.find((r) => r.id === id);
    if (!req) return null;
    Object.assign(req, patch, { updated_at: now() });
    return req;
  }

  async listHelperRequestsForHelper(helperId: string): Promise<HelperRequest[]> {
    return market().helperRequests.filter((r) => r.helper_id === helperId);
  }

  async listHelperRequestsForFamily(familyId: string): Promise<HelperRequest[]> {
    return market().helperRequests.filter((r) => r.family_id === familyId);
  }
}

interface MarketplaceState {
  helpers: Helper[];
  helperRequests: HelperRequest[];
}

const gm = globalThis as unknown as { __nonninaMarketplace?: MarketplaceState };

function market(): MarketplaceState {
  gm.__nonninaMarketplace ??= { helpers: demoHelpers(), helperRequests: demoHelperRequests(new Date()) };
  return gm.__nonninaMarketplace;
}
