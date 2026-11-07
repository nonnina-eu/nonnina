-- Demo data: family Weber, seniors Maria (82, Stuttgart, German) and Giulia (Italian, Stuttgart),
-- relatives Anna and Thomas.
-- Ids are fixed so that /demo links are identical in memory mode and Supabase mode.
-- Requires migrations 0001–0005.
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

-- Marketplace demo helpers (requires migrations 0005_marketplace and 0006_helper_photos). Same ids and
-- data as demoHelpers() in lib/db/seed.ts: 21 fictional profiles, mostly Stuttgart, a few in Esslingen
-- and Ludwigsburg. Phone numbers and emails are placeholders. is_demo = true labels them "Demo profile".
-- Re-running updates photo_url / is_demo on rows seeded before 0006.
insert into helpers (id, user_id, name, kind, city, bio, languages, services, hourly_rate_eur, phone, email, verified, active, photo_url, is_demo, created_at) values
  ('a1000000-0000-4000-8000-000000000101', null, 'Lucia Romano', 'independent', 'Stuttgart',
   'Born in Naples, in Stuttgart for 20 years. I do the weekly shopping, cook a proper lunch and stay for a coffee and a chat – in Italian or German.',
   '{it,de}', '{shopping,cooking,company}', 18, '+4915200000101', 'lucia.romano@example.com', true, true, '/helpers/lucia-romano.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000102', null, 'Mehmet Yılmaz', 'independent', 'Stuttgart',
   'I drive people to the doctor, wait with them and bring them home. I also help with phones, tablets and the TV.',
   '{de,tr,en}', '{transport,appointments,shopping,tech_help}', 20, '+4915200000102', 'mehmet.yilmaz@example.com', true, true, '/helpers/mehmet-yilmaz.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000103', null, 'Nachbarschaftshilfe Stuttgart-West', 'volunteer', 'Stuttgart',
   'Volunteer neighbours'' network. We visit, go for walks, accompany to appointments and help with small errands. Free of charge.',
   '{de}', '{company,shopping,appointments}', null, '+4915200000103', 'kontakt.nbh-west@example.com', true, true, null, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000104', null, 'Pflegedienst Sonnenhof', 'service', 'Stuttgart',
   'Licensed home care service. Personal care, household help and accompaniment. Can be paid with the relief amount (131 €/month) from care level 1.',
   '{de,en}', '{personal_care,household,appointments}', 38, '+4915200000104', 'info.sonnenhof@example.com', true, true, null, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000105', null, 'Sofia Esposito', 'volunteer', 'Stuttgart',
   'Retired teacher. I love cooking together and talking about Italy. Afternoons in Stuttgart-Ost and Bad Cannstatt.',
   '{it,de}', '{company,cooking}', null, '+4915200000105', 'sofia.esposito@example.com', false, true, null, true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000106', null, 'Jonas Becker', 'independent', 'Stuttgart',
   'Student at the University of Stuttgart. Garden work, carrying heavy shopping, setting up video calls with the grandchildren.',
   '{de,en}', '{tech_help,gardening,shopping,transport}', 15, '+4915200000106', 'jonas.becker@example.com', false, true, '/helpers/jonas-becker.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000107', null, 'Elena Petrova', 'independent', 'Stuttgart',
   'Household help with 10 years of experience. Cleaning, laundry, cooking, and sorting letters from the health insurance.',
   '{de,en,ru}', '{household,cooking,paperwork}', 22, '+4915200000107', 'elena.petrova@example.com', true, true, '/helpers/elena-petrova.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000108', null, 'Hans Müller', 'volunteer', 'Stuttgart',
   'Retired tax clerk. I help with forms, applications and letters from the Pflegekasse – and I like a game of chess.',
   '{de}', '{paperwork,company,gardening}', null, '+4915200000108', 'hans.mueller@example.com', false, true, '/helpers/hans-mueller.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000109', null, 'Tobias Wagner', 'independent', 'Stuttgart',
   'Born and raised in Stuttgart-Süd. I mow lawns, cut hedges, fix the dripping tap and drive you to the garden centre. Calm, punctual, always up for a chat.',
   '{de,en}', '{gardening,household,transport}', 19, '+4915200000109', 'tobias.wagner@example.com', true, true, '/helpers/tobias-wagner.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000110', null, 'Grace Mensah', 'independent', 'Stuttgart',
   'I work part-time in an office in Vaihingen and know German paperwork inside out. I sort letters, fill in forms with you and come along to the Bürgerbüro or the doctor''s.',
   '{de,en,fr}', '{paperwork,appointments,company}', 24, '+4915200000110', 'grace.mensah@example.com', true, true, '/helpers/grace-mensah.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000111', null, 'Rahul Sharma', 'independent', 'Stuttgart',
   'Computer science student in Vaihingen. I set up smartphones, WhatsApp and video calls, explain them slowly and write everything down. Happy to carry the shopping home too.',
   '{en,de}', '{tech_help,shopping,company}', 16, '+4915200000111', 'rahul.sharma@example.com', true, true, '/helpers/rahul-sharma.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000112', null, 'Iryna Kovalenko', 'independent', 'Stuttgart',
   'From Kharkiv, in Stuttgart-Zuffenhausen since 2022. I clean, cook soups and borscht, and I am happy to keep you company over tea.',
   '{uk,ru,de,en}', '{household,cooking,company}', 18, '+4915200000112', 'iryna.kovalenko@example.com', true, true, '/helpers/iryna-kovalenko.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000113', null, 'Ayşe Demir', 'independent', 'Stuttgart',
   'Social work student, at home in Bad Cannstatt. I go along to appointments, help with letters and forms, and do the shopping – in Turkish or German.',
   '{tr,de,en}', '{appointments,paperwork,shopping,company}', 20, '+4915200000113', 'ayse.demir@example.com', true, true, '/helpers/ayse-demir.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000114', null, 'Eleni Papadopoulou', 'volunteer', 'Stuttgart',
   'Design student in Stuttgart-Mitte. My yiayia lives far away in Thessaloniki, so I visit older neighbours here instead: walks, card games, help with the phone.',
   '{el,de,en}', '{company,tech_help,shopping}', null, '+4915200000114', 'eleni.papadopoulou@example.com', false, true, '/helpers/eleni-papadopoulou.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000115', null, 'Rafael Souza', 'independent', 'Stuttgart',
   'Trained care assistant with six years in home care, living in Feuerbach. I help with washing, dressing and getting ready for the day – patiently and with respect.',
   '{pt,es,de}', '{personal_care,household,appointments}', 27, '+4915200000115', 'rafael.souza@example.com', true, true, '/helpers/rafael-souza.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000116', null, 'Kenji Watanabe', 'volunteer', 'Esslingen',
   'Retired engineer in Esslingen. I love gardens and slow conversations. I help with pruning and planting, and with computers when they misbehave.',
   '{de,en}', '{gardening,company,tech_help}', null, '+4915200000116', 'kenji.watanabe@example.com', true, true, '/helpers/kenji-watanabe.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000117', null, 'Samuel Okafor', 'independent', 'Stuttgart',
   'Sports student in Möhringen with a driving licence and strong arms: crates of water, heavy shopping, moving furniture, raking leaves in autumn.',
   '{de,en,fr}', '{transport,shopping,gardening,household}', 16, '+4915200000117', 'samuel.okafor@example.com', false, true, '/helpers/samuel-okafor.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000118', null, 'Chiara Ferraro', 'independent', 'Stuttgart',
   'Grew up in Stuttgart-West, family from Calabria. I bring the shopping, read the paper aloud, play Scopa and help with the tablet – in Italian or German.',
   '{it,de,en}', '{company,shopping,tech_help}', 15, '+4915200000118', 'chiara.ferraro@example.com', true, true, '/helpers/chiara-ferraro.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000119', null, 'Rosa Dela Cruz', 'independent', 'Stuttgart',
   'From Manila, now in Degerloch. I cook, keep the flat tidy and love to laugh. Lunch is ready on time and there is always enough for a second plate.',
   '{en,de,es}', '{cooking,household,company}', 20, '+4915200000119', 'rosa.delacruz@example.com', true, true, '/helpers/rosa-dela-cruz.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000120', null, 'Priya Nair', 'independent', 'Ludwigsburg',
   'Accountant in Ludwigsburg, evenings and Saturdays free. I sort bank and insurance letters, set up online banking safely and go along to appointments.',
   '{en,de}', '{paperwork,tech_help,appointments}', 23, '+4915200000120', 'priya.nair@example.com', true, true, '/helpers/priya-nair.jpg', true, '2026-11-02T09:00:00Z'),
  ('a1000000-0000-4000-8000-000000000121', null, 'Alltagsbegleitung Esslingen', 'service', 'Esslingen',
   'Small team of everyday companions in Esslingen and Plochingen. Shopping, household help, walks and accompaniment to appointments, with fixed weekly visits.',
   '{de,tr,it}', '{household,shopping,company,appointments}', 32, '+4915200000121', 'team.alltag-es@example.com', true, true, null, true, '2026-11-02T09:00:00Z')
on conflict (id) do update set photo_url = excluded.photo_url, is_demo = excluded.is_demo;
