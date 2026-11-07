import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/db/memory-store";
import { DEMO_HELPER_IDS, DEMO_IDS, demoHelpers } from "@/lib/db/seed";
import { HELPER_SERVICES } from "@/lib/db/types";
import { findHelperHref, matchesHelperFilter, serviceForHelpRequest, toPublicHelper } from "@/lib/marketplace";
import { helperProfileSchema, helperQuerySchema, helperRequestFormSchema } from "@/lib/validation";
import { marketplaceStrings } from "@/lib/i18n/marketplace";

const g = globalThis as unknown as { __careCopilotMemory?: unknown; __nonninaMarketplace?: unknown };

function fresh() {
  delete g.__careCopilotMemory;
  delete g.__nonninaMarketplace;
  return new MemoryStore();
}

const validProfile = {
  name: "Giovanna Russo",
  kind: "independent",
  city: "Stuttgart",
  bio: "I cook Sunday lunch and do the shopping on Saturdays.",
  languages: ["it", "de"],
  services: ["cooking", "shopping"],
  free: false,
  hourly_rate_eur: "17,50",
  phone: "+4915200000199",
  email: "Giovanna@Example.com",
  consent_share: true,
  consent_verify: true,
};

describe("MemoryStore – marketplace", () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = fresh();
  });

  it("seeds 6–8 Stuttgart helpers with a mix of verified, unverified and volunteers", () => {
    const helpers = demoHelpers();
    expect(helpers.length).toBeGreaterThanOrEqual(6);
    expect(helpers.length).toBeLessThanOrEqual(8);
    expect(helpers.every((h) => h.city === "Stuttgart" && h.phone?.startsWith("+49152000001"))).toBe(true);
    expect(helpers.some((h) => h.verified)).toBe(true);
    expect(helpers.some((h) => !h.verified)).toBe(true);
    expect(helpers.filter((h) => h.kind === "volunteer").every((h) => h.hourly_rate_eur === null)).toBe(true);
    expect(helpers.flatMap((h) => h.services).every((s) => (HELPER_SERVICES as readonly string[]).includes(s))).toBe(true);
  });

  it("lists helpers without contact data, verified first, filtered by service, city, language and verified", async () => {
    const all = await store.listHelpers({ city: "stuttgart" });
    expect(all.length).toBe(demoHelpers().length);
    for (const h of all) {
      expect(h).not.toHaveProperty("phone");
      expect(h).not.toHaveProperty("email");
      expect(h).not.toHaveProperty("user_id");
    }
    const firstUnverified = all.findIndex((h) => !h.verified);
    expect(all.slice(firstUnverified).every((h) => !h.verified)).toBe(true);

    const shoppingIt = await store.listHelpers({ service: "shopping", language: "it" });
    expect(shoppingIt.map((h) => h.id)).toEqual([DEMO_HELPER_IDS.lucia]);

    const verifiedCompany = await store.listHelpers({ service: "company", verifiedOnly: true });
    expect(verifiedCompany.every((h) => h.verified && h.services.includes("company"))).toBe(true);
    expect(verifiedCompany.some((h) => h.id === DEMO_HELPER_IDS.sofia)).toBe(false);

    expect(await store.listHelpers({ city: "Torino" })).toEqual([]);
  });

  it("hides inactive helpers from the directory but keeps them readable by id", async () => {
    await store.updateHelper(DEMO_HELPER_IDS.hans, { active: false });
    const list = await store.listHelpers();
    expect(list.some((h) => h.id === DEMO_HELPER_IDS.hans)).toBe(false);
    expect((await store.getHelper(DEMO_HELPER_IDS.hans))?.active).toBe(false);
  });

  it("creates an unverified helper linked to a user and finds it by user id", async () => {
    const helper = await store.createHelper({
      user_id: "user-1",
      name: "Giovanna",
      kind: "volunteer",
      city: "Stuttgart",
      bio: "Hello",
      languages: ["it"],
      services: ["company"],
      hourly_rate_eur: null,
      phone: "+4915200000199",
      email: "g@example.com",
    });
    expect(helper.verified).toBe(false);
    expect(helper.active).toBe(true);
    expect((await store.getHelperByUserId("user-1"))?.id).toBe(helper.id);
    expect(await store.getHelperByUserId("nobody")).toBeNull();
  });

  it("runs a helper request from sent to accepted to done and lists it for helper and family", async () => {
    const req = await store.createHelperRequest({
      family_id: DEMO_IDS.family,
      senior_id: DEMO_IDS.senior,
      helper_id: DEMO_HELPER_IDS.lucia,
      relative_id: DEMO_IDS.anna,
      help_request_id: null,
      service: "shopping",
      message: "Weekly shopping please",
      preferred_time: "Tuesday morning",
    });
    expect(req.status).toBe("sent");
    expect(req.notified).toEqual([]);
    expect((await store.listHelperRequestsForHelper(DEMO_HELPER_IDS.lucia)).map((r) => r.id)).toEqual([req.id]);
    expect((await store.listHelperRequestsForFamily(DEMO_IDS.family)).map((r) => r.id)).toEqual([req.id]);
    expect(await store.listHelperRequestsForHelper(DEMO_HELPER_IDS.mehmet)).toEqual([]);

    const accepted = await store.updateHelperRequest(req.id, { status: "accepted" });
    expect(accepted?.status).toBe("accepted");
    expect((await store.getHelperRequest(req.id))?.status).toBe("accepted");
    expect(await store.updateHelperRequest("00000000-0000-4000-8000-000000000000", { status: "done" })).toBeNull();
  });

  it("keeps helper requests when the family demo data (events, help requests) is reset", async () => {
    await store.createHelperRequest({
      family_id: DEMO_IDS.family,
      senior_id: DEMO_IDS.senior,
      helper_id: DEMO_HELPER_IDS.lucia,
      relative_id: null,
      help_request_id: null,
      service: "cooking",
      message: "Lunch on Sunday",
      preferred_time: null,
    });
    await store.resetDemoData(DEMO_IDS.family);
    expect(await store.listHelperRequestsForFamily(DEMO_IDS.family)).toHaveLength(1);
  });
});

describe("toPublicHelper / matchesHelperFilter", () => {
  it("strips phone, email and user id", () => {
    const pub = toPublicHelper({ ...demoHelpers()[0], user_id: "u" });
    expect(Object.keys(pub)).not.toEqual(expect.arrayContaining(["phone"]));
    expect("email" in pub || "phone" in pub || "user_id" in pub).toBe(false);
  });

  it("never matches inactive helpers", () => {
    expect(matchesHelperFilter({ ...demoHelpers()[0], active: false })).toBe(false);
  });
});

describe("helperProfileSchema", () => {
  it("accepts a valid sign-up and normalises rate and email", () => {
    const r = helperProfileSchema().safeParse(validProfile);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.hourly_rate_eur).toBe(17.5);
      expect(r.data.email).toBe("giovanna@example.com");
      expect(r.data).not.toHaveProperty("consent_share");
    }
  });

  it("requires both consents on sign-up but not on edit", () => {
    const noConsent = { ...validProfile, consent_share: false, consent_verify: false };
    const signup = helperProfileSchema().safeParse(noConsent);
    expect(signup.success).toBe(false);
    if (!signup.success) expect(signup.error.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["consent_share", "consent_verify"]));
    expect(helperProfileSchema({ requireConsent: false }).safeParse(noConsent).success).toBe(true);
  });

  it("requires a rate unless free or volunteer, and drops the rate for volunteers", () => {
    const noRate = helperProfileSchema().safeParse({ ...validProfile, hourly_rate_eur: "" });
    expect(noRate.success).toBe(false);
    if (!noRate.success) expect(noRate.error.issues[0].path[0]).toBe("hourly_rate_eur");

    const free = helperProfileSchema().safeParse({ ...validProfile, hourly_rate_eur: "", free: true });
    expect(free.success && free.data.hourly_rate_eur).toBe(null);

    const volunteer = helperProfileSchema().safeParse({ ...validProfile, kind: "volunteer", hourly_rate_eur: "20" });
    expect(volunteer.success && volunteer.data.hourly_rate_eur).toBe(null);

    expect(helperProfileSchema().safeParse({ ...validProfile, hourly_rate_eur: "500" }).success).toBe(false);
    expect(helperProfileSchema().safeParse({ ...validProfile, hourly_rate_eur: "abc" }).success).toBe(false);
  });

  it("rejects unknown services, empty languages, bad phone and short bio", () => {
    const r = helperProfileSchema().safeParse({ ...validProfile, services: ["babysitting"], languages: [], phone: "0151 123", bio: "hi" });
    expect(r.success).toBe(false);
    if (!r.success) expect(new Set(r.error.issues.map((i) => i.path[0]))).toEqual(new Set(["services", "languages", "phone", "bio"]));
  });
});

describe("helperRequestFormSchema / helperQuerySchema", () => {
  const base = { helper_id: DEMO_HELPER_IDS.lucia, senior_id: DEMO_IDS.senior, service: "shopping", message: "Weekly shopping" };

  it("turns empty optional fields into null", () => {
    const r = helperRequestFormSchema.safeParse({ ...base, preferred_time: "", help_request_id: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.preferred_time).toBeNull();
      expect(r.data.help_request_id).toBeNull();
    }
  });

  it("rejects a too short message and an unknown service", () => {
    expect(helperRequestFormSchema.safeParse({ ...base, message: "hi" }).success).toBe(false);
    expect(helperRequestFormSchema.safeParse({ ...base, service: "babysitting" }).success).toBe(false);
  });

  it("validates the public API query", () => {
    expect(helperQuerySchema.safeParse({ service: "cooking", city: "Stuttgart", language: "it", verified: "1" }).success).toBe(true);
    expect(helperQuerySchema.safeParse({ service: "babysitting" }).success).toBe(false);
  });
});

describe("serviceForHelpRequest (help request category → marketplace service)", () => {
  it("maps categories to a default service", () => {
    expect(serviceForHelpRequest("daily_help")).toBe("shopping");
    expect(serviceForHelpRequest("loneliness")).toBe("company");
    expect(serviceForHelpRequest("health")).toBe("appointments");
    expect(serviceForHelpRequest("legal")).toBe("paperwork");
    expect(serviceForHelpRequest("money")).toBe("paperwork");
    expect(serviceForHelpRequest("other")).toBeNull();
  });

  it("lets keywords in the summary (DE / IT / EN) win over the category", () => {
    expect(serviceForHelpRequest("daily_help", "Ich schaffe den Einkauf nicht mehr")).toBe("shopping");
    expect(serviceForHelpRequest("daily_help", "Ich brauche jemanden, der mit mir zum Arzt geht")).toBe("appointments");
    expect(serviceForHelpRequest("other", "Non riesco più a cucinare il pranzo")).toBe("cooking");
    expect(serviceForHelpRequest("other", "Mi sento sola, vorrei un po' di compagnia")).toBe("company");
    expect(serviceForHelpRequest("daily_help", "Mein Tablet funktioniert nicht")).toBe("tech_help");
    expect(serviceForHelpRequest("other", "Der Rasen im Garten ist zu hoch")).toBe("gardening");
  });

  it("builds the /helpers link with service and request id", () => {
    expect(findHelperHref({ id: "abc", category: "loneliness", summary: "" })).toBe("/helpers?service=company&request=abc");
    expect(findHelperHref({ id: "abc", category: "other", summary: "" })).toBe("/helpers?request=abc");
  });
});

describe("marketplace i18n", () => {
  it("has a label for every service in en, de and it", () => {
    for (const locale of ["en", "de", "it"] as const) {
      for (const s of HELPER_SERVICES) expect(marketplaceStrings[locale].services[s]).toBeTruthy();
    }
  });
});
