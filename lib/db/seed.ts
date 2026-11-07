import { berlinDate } from "@/lib/relief-budget";
import type { Family, Helper, HelperRequest, Relative, Senior } from "./types";

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

/**
 * Demo helpers (marketplace showcase): mostly Stuttgart, a few in Esslingen and Ludwigsburg.
 * Fictional people. Same ids and data in supabase/seed.sql. Phone numbers and emails are
 * placeholders. All rows are is_demo = true, so the directory labels them "Demo profile".
 * relief_eligible = true for the two services and three verified independents that plausibly are
 * recognised offers (payable via the relief amount).
 */
export const DEMO_HELPER_IDS = {
  lucia: "a1000000-0000-4000-8000-000000000101",
  mehmet: "a1000000-0000-4000-8000-000000000102",
  nachbarschaft: "a1000000-0000-4000-8000-000000000103",
  sonnenhof: "a1000000-0000-4000-8000-000000000104",
  sofia: "a1000000-0000-4000-8000-000000000105",
  jonas: "a1000000-0000-4000-8000-000000000106",
  elena: "a1000000-0000-4000-8000-000000000107",
  hans: "a1000000-0000-4000-8000-000000000108",
  tobias: "a1000000-0000-4000-8000-000000000109",
  grace: "a1000000-0000-4000-8000-000000000110",
  rahul: "a1000000-0000-4000-8000-000000000111",
  iryna: "a1000000-0000-4000-8000-000000000112",
  ayse: "a1000000-0000-4000-8000-000000000113",
  eleni: "a1000000-0000-4000-8000-000000000114",
  rafael: "a1000000-0000-4000-8000-000000000115",
  kenji: "a1000000-0000-4000-8000-000000000116",
  samuel: "a1000000-0000-4000-8000-000000000117",
  chiara: "a1000000-0000-4000-8000-000000000118",
  rosa: "a1000000-0000-4000-8000-000000000119",
  priya: "a1000000-0000-4000-8000-000000000120",
  alltag: "a1000000-0000-4000-8000-000000000121",
} as const;

export function demoHelpers(): Helper[] {
  const at = new Date("2026-11-02T09:00:00Z").toISOString();
  const base = { user_id: null, city: "Stuttgart", active: true, is_demo: true, photo_url: null, relief_eligible: false, created_at: at };
  return [
    {
      ...base,
      id: DEMO_HELPER_IDS.lucia,
      name: "Lucia Romano",
      relief_eligible: true,
      kind: "independent",
      bio: "Born in Naples, in Stuttgart for 20 years. I do the weekly shopping, cook a proper lunch and stay for a coffee and a chat – in Italian or German.",
      languages: ["it", "de"],
      services: ["shopping", "cooking", "company"],
      hourly_rate_eur: 18,
      phone: "+4915200000101",
      email: "lucia.romano@example.com",
      verified: true,
      photo_url: "/helpers/lucia-romano.jpg",
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
      photo_url: "/helpers/mehmet-yilmaz.jpg",
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
      relief_eligible: true,
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
      photo_url: "/helpers/jonas-becker.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.elena,
      name: "Elena Petrova",
      relief_eligible: true,
      kind: "independent",
      bio: "Household help with 10 years of experience. Cleaning, laundry, cooking, and sorting letters from the health insurance.",
      languages: ["de", "en", "ru"],
      services: ["household", "cooking", "paperwork"],
      hourly_rate_eur: 22,
      phone: "+4915200000107",
      email: "elena.petrova@example.com",
      verified: true,
      photo_url: "/helpers/elena-petrova.jpg",
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
      photo_url: "/helpers/hans-mueller.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.tobias,
      name: "Tobias Wagner",
      kind: "independent",
      bio: "Born and raised in Stuttgart-Süd. I mow lawns, cut hedges, fix the dripping tap and drive you to the garden centre. Calm, punctual, always up for a chat.",
      languages: ["de", "en"],
      services: ["gardening", "household", "transport"],
      hourly_rate_eur: 19,
      phone: "+4915200000109",
      email: "tobias.wagner@example.com",
      verified: true,
      photo_url: "/helpers/tobias-wagner.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.grace,
      name: "Grace Mensah",
      kind: "independent",
      bio: "I work part-time in an office in Vaihingen and know German paperwork inside out. I sort letters, fill in forms with you and come along to the Bürgerbüro or the doctor's.",
      languages: ["de", "en", "fr"],
      services: ["paperwork", "appointments", "company"],
      hourly_rate_eur: 24,
      phone: "+4915200000110",
      email: "grace.mensah@example.com",
      verified: true,
      photo_url: "/helpers/grace-mensah.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.rahul,
      name: "Rahul Sharma",
      kind: "independent",
      bio: "Computer science student in Vaihingen. I set up smartphones, WhatsApp and video calls, explain them slowly and write everything down. Happy to carry the shopping home too.",
      languages: ["en", "de"],
      services: ["tech_help", "shopping", "company"],
      hourly_rate_eur: 16,
      phone: "+4915200000111",
      email: "rahul.sharma@example.com",
      verified: true,
      photo_url: "/helpers/rahul-sharma.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.iryna,
      name: "Iryna Kovalenko",
      kind: "independent",
      bio: "From Kharkiv, in Stuttgart-Zuffenhausen since 2022. I clean, cook soups and borscht, and I am happy to keep you company over tea.",
      languages: ["uk", "ru", "de", "en"],
      services: ["household", "cooking", "company"],
      hourly_rate_eur: 18,
      phone: "+4915200000112",
      email: "iryna.kovalenko@example.com",
      verified: true,
      photo_url: "/helpers/iryna-kovalenko.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.ayse,
      name: "Ayşe Demir",
      kind: "independent",
      bio: "Social work student, at home in Bad Cannstatt. I go along to appointments, help with letters and forms, and do the shopping – in Turkish or German.",
      languages: ["tr", "de", "en"],
      services: ["appointments", "paperwork", "shopping", "company"],
      hourly_rate_eur: 20,
      phone: "+4915200000113",
      email: "ayse.demir@example.com",
      verified: true,
      photo_url: "/helpers/ayse-demir.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.eleni,
      name: "Eleni Papadopoulou",
      kind: "volunteer",
      bio: "Design student in Stuttgart-Mitte. My yiayia lives far away in Thessaloniki, so I visit older neighbours here instead: walks, card games, help with the phone.",
      languages: ["el", "de", "en"],
      services: ["company", "tech_help", "shopping"],
      hourly_rate_eur: null,
      phone: "+4915200000114",
      email: "eleni.papadopoulou@example.com",
      verified: false,
      photo_url: "/helpers/eleni-papadopoulou.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.rafael,
      name: "Rafael Souza",
      relief_eligible: true,
      kind: "independent",
      bio: "Trained care assistant with six years in home care, living in Feuerbach. I help with washing, dressing and getting ready for the day – patiently and with respect.",
      languages: ["pt", "es", "de"],
      services: ["personal_care", "household", "appointments"],
      hourly_rate_eur: 27,
      phone: "+4915200000115",
      email: "rafael.souza@example.com",
      verified: true,
      photo_url: "/helpers/rafael-souza.jpg",
    },
    {
      ...base,
      city: "Esslingen",
      id: DEMO_HELPER_IDS.kenji,
      name: "Kenji Watanabe",
      kind: "volunteer",
      bio: "Retired engineer in Esslingen. I love gardens and slow conversations. I help with pruning and planting, and with computers when they misbehave.",
      languages: ["de", "en"],
      services: ["gardening", "company", "tech_help"],
      hourly_rate_eur: null,
      phone: "+4915200000116",
      email: "kenji.watanabe@example.com",
      verified: true,
      photo_url: "/helpers/kenji-watanabe.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.samuel,
      name: "Samuel Okafor",
      kind: "independent",
      bio: "Sports student in Möhringen with a driving licence and strong arms: crates of water, heavy shopping, moving furniture, raking leaves in autumn.",
      languages: ["de", "en", "fr"],
      services: ["transport", "shopping", "gardening", "household"],
      hourly_rate_eur: 16,
      phone: "+4915200000117",
      email: "samuel.okafor@example.com",
      verified: false,
      photo_url: "/helpers/samuel-okafor.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.chiara,
      name: "Chiara Ferraro",
      kind: "independent",
      bio: "Grew up in Stuttgart-West, family from Calabria. I bring the shopping, read the paper aloud, play Scopa and help with the tablet – in Italian or German.",
      languages: ["it", "de", "en"],
      services: ["company", "shopping", "tech_help"],
      hourly_rate_eur: 15,
      phone: "+4915200000118",
      email: "chiara.ferraro@example.com",
      verified: true,
      photo_url: "/helpers/chiara-ferraro.jpg",
    },
    {
      ...base,
      id: DEMO_HELPER_IDS.rosa,
      name: "Rosa Dela Cruz",
      kind: "independent",
      bio: "From Manila, now in Degerloch. I cook, keep the flat tidy and love to laugh. Lunch is ready on time and there is always enough for a second plate.",
      languages: ["en", "de", "es"],
      services: ["cooking", "household", "company"],
      hourly_rate_eur: 20,
      phone: "+4915200000119",
      email: "rosa.delacruz@example.com",
      verified: true,
      photo_url: "/helpers/rosa-dela-cruz.jpg",
    },
    {
      ...base,
      city: "Ludwigsburg",
      id: DEMO_HELPER_IDS.priya,
      name: "Priya Nair",
      kind: "independent",
      bio: "Accountant in Ludwigsburg, evenings and Saturdays free. I sort bank and insurance letters, set up online banking safely and go along to appointments.",
      languages: ["en", "de"],
      services: ["paperwork", "tech_help", "appointments"],
      hourly_rate_eur: 23,
      phone: "+4915200000120",
      email: "priya.nair@example.com",
      verified: true,
      photo_url: "/helpers/priya-nair.jpg",
    },
    {
      ...base,
      city: "Esslingen",
      id: DEMO_HELPER_IDS.alltag,
      name: "Alltagsbegleitung Esslingen",
      relief_eligible: true,
      kind: "service",
      bio: "Small team of everyday companions in Esslingen and Plochingen. Shopping, household help, walks and accompaniment to appointments, with fixed weekly visits.",
      languages: ["de", "tr", "it"],
      services: ["household", "shopping", "company", "appointments"],
      hourly_rate_eur: 32,
      phone: "+4915200000121",
      email: "team.alltag-es@example.com",
      verified: true,
    },
  ];
}

/** Fixed ids of the seeded completed jobs (same in supabase/seed.sql). */
export const DEMO_JOB_IDS = {
  elenaNow: "b2000000-0000-4000-8000-000000000201",
  luciaNow: "b2000000-0000-4000-8000-000000000202",
  mehmetNow: "b2000000-0000-4000-8000-000000000203",
  nachbarschaftNow: "b2000000-0000-4000-8000-000000000204",
  elenaPrev: "b2000000-0000-4000-8000-000000000205",
  rafaelPrev: "b2000000-0000-4000-8000-000000000206",
  /** Accepted, not yet done: shows the "record as done" form on /helpers/me (Lucia) and /app. */
  luciaOpen: "b2000000-0000-4000-8000-000000000207",
} as const;

/**
 * Day `day` (1-based) of the month `monthOffset` months from `now`, 10:00 UTC, but never in the
 * future (early in the month the current-month jobs collapse to "now"). Mirrors
 * least(now(), date_trunc('month', now()) + …) in supabase/seed.sql.
 */
function demoJobTime(now: Date, monthOffset: number, day: number): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, day, 10, 0, 0));
  return d.getTime() > now.getTime() ? now : d;
}

/**
 * Completed jobs for Maria so the relief-amount card shows real numbers in demo mode:
 * (plus one accepted request still open). This month 55 + 36 € eligible (91 € of 131 € used), 30 € transport by a helper who is not
 * recognised (family pays) and a free volunteer visit; last month 120 € eligible (11 € carried over).
 */
export function demoHelperRequests(now: Date = new Date()): HelperRequest[] {
  const jobs: Array<{ id: string; helper: string; service: HelperRequest["service"]; message: string; hours: number; amount: number; month: number; day: number }> = [
    { id: DEMO_JOB_IDS.elenaNow, helper: DEMO_HELPER_IDS.elena, service: "household", message: "Cleaning and laundry", hours: 2.5, amount: 55, month: 0, day: 2 },
    { id: DEMO_JOB_IDS.nachbarschaftNow, helper: DEMO_HELPER_IDS.nachbarschaft, service: "company", message: "Walk in the park and a coffee", hours: 2, amount: 0, month: 0, day: 3 },
    { id: DEMO_JOB_IDS.luciaNow, helper: DEMO_HELPER_IDS.lucia, service: "shopping", message: "Weekly shopping", hours: 2, amount: 36, month: 0, day: 4 },
    { id: DEMO_JOB_IDS.mehmetNow, helper: DEMO_HELPER_IDS.mehmet, service: "transport", message: "Drive to the eye doctor and back", hours: 1.5, amount: 30, month: 0, day: 5 },
    { id: DEMO_JOB_IDS.elenaPrev, helper: DEMO_HELPER_IDS.elena, service: "household", message: "Cleaning and laundry", hours: 3, amount: 66, month: -1, day: 10 },
    { id: DEMO_JOB_IDS.rafaelPrev, helper: DEMO_HELPER_IDS.rafael, service: "personal_care", message: "Help with showering and dressing", hours: 2, amount: 54, month: -1, day: 20 },
  ];
  const done = jobs.map((j): HelperRequest => {
    const at = demoJobTime(now, j.month, j.day);
    const sent = new Date(at.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: j.id,
      family_id: DEMO_IDS.family,
      senior_id: DEMO_IDS.senior,
      helper_id: j.helper,
      relative_id: DEMO_IDS.anna,
      help_request_id: null,
      service: j.service,
      message: j.message,
      preferred_time: null,
      status: "done",
      notified: [],
      hours: j.hours,
      amount_eur: j.amount,
      service_date: berlinDate(at),
      completed_at: at.toISOString(),
      created_at: sent,
      updated_at: at.toISOString(),
    };
  });
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const open: HelperRequest = {
    id: DEMO_JOB_IDS.luciaOpen,
    family_id: DEMO_IDS.family,
    senior_id: DEMO_IDS.senior,
    helper_id: DEMO_HELPER_IDS.lucia,
    relative_id: DEMO_IDS.anna,
    help_request_id: null,
    service: "cooking",
    message: "Could you cook lunch with Maria on Saturday?",
    preferred_time: "Saturday, 11:00",
    status: "accepted",
    notified: [],
    hours: null,
    amount_eur: null,
    service_date: null,
    completed_at: null,
    created_at: yesterday,
    updated_at: yesterday,
  };
  // Newest first, like the store lists them.
  return [open, ...done.sort((a, b) => b.created_at.localeCompare(a.created_at))];
}
