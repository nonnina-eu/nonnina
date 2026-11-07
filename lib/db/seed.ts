import type { Family, Relative, Senior } from "./types";

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
