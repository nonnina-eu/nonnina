import { randomUUID } from "node:crypto";
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
  NotificationRecord,
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

function context(s: MemoryState, senior: Senior): SeniorContext | null {
  const family = s.families.find((f) => f.id === senior.family_id);
  if (!family) return null;
  const relatives = s.relatives
    .filter((r) => r.family_id === family.id)
    .sort((a, b) => a.priority - b.priority);
  return { senior, family, relatives };
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

  async updateEmergencyEvent(
    id: string,
    patch: Partial<{ status: EmergencyStatus; notified: NotificationRecord[] }>,
  ): Promise<EmergencyEvent | null> {
    const event = state().events.find((e) => e.id === id);
    if (!event) return null;
    Object.assign(event, patch, { updated_at: now() });
    return event;
  }

  async createHelpRequest(input: NewHelpRequest): Promise<HelpRequest> {
    const req: HelpRequest = { id: randomUUID(), ...input, created_at: now() };
    state().helpRequests.unshift(req);
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
}
