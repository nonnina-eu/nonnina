-- Demo data: family Weber, seniors Maria (82, Stuttgart, German) and Giulia (Italian, Stuttgart),
-- relatives Anna and Thomas.
-- Ids are fixed so that /demo links are identical in memory mode and Supabase mode.
-- Requires migrations 0001 and 0002.
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
