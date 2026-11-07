-- Demo data: family Weber, seniors Maria (82, Stuttgart, German) and Giulia (Italian, Stuttgart),
-- relatives Anna and Thomas.
-- Ids are fixed so that /demo links are identical in memory mode and Supabase mode.
-- Requires migrations 0001–0004.
insert into families (id, name, email, fallback_phone) values
  ('11111111-1111-4111-8111-111111111111', 'Weber', 'anna.weber@example.com', '+4915100000003')
on conflict (id) do nothing;

insert into seniors (id, family_id, first_name, language, city, address_note, care_level, device_token, medication_times) values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Maria', 'de', 'Stuttgart',
   'Schlüssel bei Nachbar Thomas, Wohnung 3', 3, 'maria-demo',
   '[{"time":"08:00","label":"Tabletten"},{"time":"18:00","label":"Tabletten"}]'::jsonb)
on conflict (id) do nothing;

-- Giulia: same family, Italian screen + Italian SMS (device token giulia-demo).
-- created_at after Maria so the family pages keep Maria as the first senior (ordered by created_at).
insert into seniors (id, family_id, first_name, language, city, address_note, care_level, device_token, medication_times, created_at) values
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Giulia', 'it', 'Stuttgart',
   null, 2, 'giulia-demo',
   '[{"time":"08:00","label":"Pastiglie"},{"time":"18:00","label":"Pastiglie"}]'::jsonb,
   now() + interval '1 second')
on conflict (id) do nothing;

-- Replace the placeholder numbers with real E.164 numbers before a live demo.
-- user_id stays null until a relative signs in and is linked (relatives.user_id).
insert into relatives (id, family_id, name, relation, phone, email, notify_sms, notify_call, priority, user_id) values
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'Anna', 'daughter', '+4915200000001', 'anna.weber@example.com', true, true, 1, null),
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', 'Thomas', 'neighbour', '+4915200000002', null, true, false, 2, null)
on conflict (id) do nothing;

-- Marketplace demo helpers in Stuttgart (requires migration 0004). Same ids and data as
-- demoHelpers() in lib/db/seed.ts. Phone numbers are placeholders.
insert into helpers (id, user_id, name, kind, city, bio, languages, services, hourly_rate_eur, phone, email, verified, active, created_at) values
  ('a1000000-0000-4000-8000-000000000101', null, 'Lucia Romano', 'independent', 'Stuttgart',
   'Born in Naples, in Stuttgart for 20 years. I do the weekly shopping, cook a proper lunch and stay for a coffee and a chat – in Italian or German.',
   '{it,de}', '{shopping,cooking,company}', 18, '+4915200000101', 'lucia.romano@example.com', true, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000102', null, 'Mehmet Yılmaz', 'independent', 'Stuttgart',
   'I drive people to the doctor, wait with them and bring them home. I also help with phones, tablets and the TV.',
   '{de,tr,en}', '{transport,appointments,shopping,tech_help}', 20, '+4915200000102', 'mehmet.yilmaz@example.com', true, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000103', null, 'Nachbarschaftshilfe Stuttgart-West', 'volunteer', 'Stuttgart',
   'Volunteer neighbours'' network. We visit, go for walks, accompany to appointments and help with small errands. Free of charge.',
   '{de}', '{company,shopping,appointments}', null, '+4915200000103', 'kontakt.nbh-west@example.com', true, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000104', null, 'Pflegedienst Sonnenhof', 'service', 'Stuttgart',
   'Licensed home care service. Personal care, household help and accompaniment. Can be paid with the relief amount (131 €/month) from care level 1.',
   '{de,en}', '{personal_care,household,appointments}', 38, '+4915200000104', 'info.sonnenhof@example.com', true, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000105', null, 'Sofia Esposito', 'volunteer', 'Stuttgart',
   'Retired teacher. I love cooking together and talking about Italy. Afternoons in Stuttgart-Ost and Bad Cannstatt.',
   '{it,de}', '{company,cooking}', null, '+4915200000105', 'sofia.esposito@example.com', false, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000106', null, 'Jonas Becker', 'independent', 'Stuttgart',
   'Student at the University of Stuttgart. Garden work, carrying heavy shopping, setting up video calls with the grandchildren.',
   '{de,en}', '{tech_help,gardening,shopping,transport}', 15, '+4915200000106', 'jonas.becker@example.com', false, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000107', null, 'Elena Petrova', 'independent', 'Stuttgart',
   'Household help with 10 years of experience. Cleaning, laundry, cooking, and sorting letters from the health insurance.',
   '{de,en,ru}', '{household,cooking,paperwork}', 22, '+4915200000107', 'elena.petrova@example.com', true, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000108', null, 'Hans Müller', 'volunteer', 'Stuttgart',
   'Retired tax clerk. I help with forms, applications and letters from the Pflegekasse – and I like a game of chess.',
   '{de}', '{paperwork,company,gardening}', null, '+4915200000108', 'hans.mueller@example.com', false, true, '2026-11-02T09:00:00Z')
on conflict (id) do nothing;
