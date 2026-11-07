import type { Family, Helper, Relative, Senior } from "./types";

/**
 * Deterministic demo ids. They are identical in supabase/seed.sql so that the
 * /demo links work in both the in-memory and the Supabase mode.
 */
export const DEMO_IDS = {
  family: "11111111-1111-4111-8111-111111111111",
  senior: "22222222-2222-4222-8222-222222222222",
  anna: "33333333-3333-4333-8333-333333333333",
  thomas: "44444444-4444-4444-8444-444444444444",
  /** Second demo senior: Italian, living in Stuttgart, same family. */
  giulia: "55555555-5555-4555-8555-555555555555",
} as const;

export const DEMO_TOKEN = "maria-demo";
export const DEMO_TOKEN_IT = "giulia-demo";

export function demoFamily(): Family {
  return {
    id: DEMO_IDS.family,
    name: "Weber",
    email: "anna.weber@example.com",
    fallback_phone: process.env.SEED_FALLBACK_PHONE || "+4915100000003",
    created_at: new Date("2026-11-01T08:00:00Z").toISOString(),
  };
}

export function demoSenior(): Senior {
  return {
    id: DEMO_IDS.senior,
    family_id: DEMO_IDS.family,
    first_name: "Maria",
    language: "de",
    city: "Stuttgart",
    address_note: "Schlüssel bei Nachbar Thomas, Wohnung 3",
    care_level: 3,
    device_token: DEMO_TOKEN,
    medication_times: [
      { time: "08:00", label: "Tabletten" },
      { time: "18:00", label: "Tabletten" },
    ],
    created_at: new Date("2026-11-01T08:00:00Z").toISOString(),
  };
}

/** Giulia: Italian speaker in Stuttgart, so the demo shows the IT senior screen and IT SMS. */
export function demoSeniorIt(): Senior {
  return {
    id: DEMO_IDS.giulia,
    family_id: DEMO_IDS.family,
    first_name: "Giulia",
    language: "it",
    city: "Stuttgart",
    address_note: null,
    care_level: 2,
    device_token: DEMO_TOKEN_IT,
    medication_times: [
      { time: "08:00", label: "Pastiglie" },
      { time: "18:00", label: "Pastiglie" },
    ],
    created_at: new Date("2026-11-01T08:05:00Z").toISOString(),
  };
}

/** Both demo seniors, Maria first (the family pages show the first senior as the main one). */
export function demoSeniors(): Senior[] {
  return [demoSenior(), demoSeniorIt()];
}

export function demoRelatives(): Relative[] {
  return [
    {
      id: DEMO_IDS.anna,
      family_id: DEMO_IDS.family,
      name: "Anna",
      relation: "daughter",
      phone: process.env.SEED_RELATIVE_ANNA_PHONE || "+4915200000001",
      email: "anna.weber@example.com",
      notify_sms: true,
      notify_call: true,
      priority: 1,
      user_id: null,
    },
    {
      id: DEMO_IDS.thomas,
      family_id: DEMO_IDS.family,
      name: "Thomas",
      relation: "neighbour",
      phone: process.env.SEED_RELATIVE_THOMAS_PHONE || "+4915200000002",
      email: null,
      notify_sms: true,
      notify_call: false,
      priority: 2,
      user_id: null,
    },
  ];
}

/** Demo helpers in Stuttgart. Same ids and data in supabase/seed.sql. Phone numbers are placeholders. */
export const DEMO_HELPER_IDS = {
  lucia: "a1000000-0000-4000-8000-000000000101",
  mehmet: "a1000000-0000-4000-8000-000000000102",
  nachbarschaft: "a1000000-0000-4000-8000-000000000103",
  sonnenhof: "a1000000-0000-4000-8000-000000000104",
  sofia: "a1000000-0000-4000-8000-000000000105",
  jonas: "a1000000-0000-4000-8000-000000000106",
  elena: "a1000000-0000-4000-8000-000000000107",
  hans: "a1000000-0000-4000-8000-000000000108",
} as const;

export function demoHelpers(): Helper[] {
  const at = new Date("2026-11-02T09:00:00Z").toISOString();
  const base = { user_id: null, city: "Stuttgart", active: true, created_at: at };
  return [
    {
      ...base,
      id: DEMO_HELPER_IDS.lucia,
      name: "Lucia Romano",
      kind: "independent",
      bio: "Born in Naples, in Stuttgart for 20 years. I do the weekly shopping, cook a proper lunch and stay for a coffee and a chat – in Italian or German.",
      languages: ["it", "de"],
      services: ["shopping", "cooking", "company"],
      hourly_rate_eur: 18,
      phone: "+4915200000101",
      email: "lucia.romano@example.com",
      verified: true,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.mehmet,
      name: "Mehmet Yılmaz",
      kind: "independent",
      bio: "I drive people to the doctor, wait with them and bring them home. I also help with phones, tablets and the TV.",
      languages: ["de", "tr", "en"],
      services: ["transport", "appointments", "shopping", "tech_help"],
      hourly_rate_eur: 20,
      phone: "+4915200000102",
      email: "mehmet.yilmaz@example.com",
      verified: true,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.nachbarschaft,
      name: "Nachbarschaftshilfe Stuttgart-West",
      kind: "volunteer",
      bio: "Volunteer neighbours' network. We visit, go for walks, accompany to appointments and help with small errands. Free of charge.",
      languages: ["de"],
      services: ["company", "shopping", "appointments"],
      hourly_rate_eur: null,
      phone: "+4915200000103",
      email: "kontakt.nbh-west@example.com",
      verified: true,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.sonnenhof,
      name: "Pflegedienst Sonnenhof",
      kind: "service",
      bio: "Licensed home care service. Personal care, household help and accompaniment. Can be paid with the relief amount (131 €/month) from care level 1.",
      languages: ["de", "en"],
      services: ["personal_care", "household", "appointments"],
      hourly_rate_eur: 38,
      phone: "+4915200000104",
      email: "info.sonnenhof@example.com",
      verified: true,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.sofia,
      name: "Sofia Esposito",
      kind: "volunteer",
      bio: "Retired teacher. I love cooking together and talking about Italy. Afternoons in Stuttgart-Ost and Bad Cannstatt.",
      languages: ["it", "de"],
      services: ["company", "cooking"],
      hourly_rate_eur: null,
      phone: "+4915200000105",
      email: "sofia.esposito@example.com",
      verified: false,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.jonas,
      name: "Jonas Becker",
      kind: "independent",
      bio: "Student at the University of Stuttgart. Garden work, carrying heavy shopping, setting up video calls with the grandchildren.",
      languages: ["de", "en"],
      services: ["tech_help", "gardening", "shopping", "transport"],
      hourly_rate_eur: 15,
      phone: "+4915200000106",
      email: "jonas.becker@example.com",
      verified: false,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.elena,
      name: "Elena Petrova",
      kind: "independent",
      bio: "Household help with 10 years of experience. Cleaning, laundry, cooking, and sorting letters from the health insurance.",
      languages: ["de", "en", "ru"],
      services: ["household", "cooking", "paperwork"],
      hourly_rate_eur: 22,
      phone: "+4915200000107",
      email: "elena.petrova@example.com",
      verified: true,
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.hans,
      name: "Hans Müller",
      kind: "volunteer",
      bio: "Retired tax clerk. I help with forms, applications and letters from the Pflegekasse – and I like a game of chess.",
      languages: ["de"],
      services: ["paperwork", "company", "gardening"],
      hourly_rate_eur: null,
      phone: "+4915200000108",
      email: "hans.mueller@example.com",
      verified: false,
    },
  ];
}
