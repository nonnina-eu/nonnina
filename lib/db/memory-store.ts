import { randomBytes, randomUUID } from "node:crypto";
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
import { demoFamily, demoRelatives, demoSenior } from "./seed";

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
      seniors: [demoSenior()],
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
    const req: HelpRequest = { id: randomUUID(), ...input, resolved_at: null, created_at: now() };
    state().helpRequests.unshift(req);
    return req;
  }

  async updateHelpRequest(id: string, patch: HelpRequestPatch): Promise<HelpRequest | null> {
    const req = state().helpRequests.find((h) => h.id === id);
    if (!req) return null;
    Object.assign(req, patch);
    return req;
  }

  async createVoiceSession(input: NewVoiceSession): Promise<VoiceSession> {
    const session: VoiceSession = { id: randomUUID(), ...input, created_at: now() };
    state().sessions.unshift(session);
    return session;
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
}
