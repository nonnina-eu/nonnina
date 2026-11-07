-- Care Copilot · initial schema
-- Server routes use the service role. The browser only inserts into `waitlist`
-- and reads family data through the anon key for realtime (Layer 2 will add auth).

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type senior_language as enum ('de', 'it');
create type session_mood as enum ('good', 'ok', 'low', 'worried');
create type help_category as enum ('daily_help', 'legal', 'money', 'health', 'loneliness', 'other');
create type help_status as enum ('open', 'ai_solved', 'escalated', 'matched');
create type emergency_level as enum ('emergency', 'warning');
create type emergency_source as enum ('agent_tool', 'keyword_detector', 'manual_button', 'no_response');
create type emergency_status as enum ('open', 'relatives_notified', 'acknowledged', 'cancelled_by_senior');
create type waitlist_role as enum ('family', 'helper', 'care_service', 'other');

-- ---------- tables ----------
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table relatives (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  relation text not null,
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{6,14}$'),
  email text,
  notify_sms boolean not null default true,
  notify_call boolean not null default false,
  priority int not null default 1 check (priority >= 1)
);
create index relatives_family_idx on relatives(family_id, priority);

create table seniors (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  first_name text not null,
  language senior_language not null default 'de',
  city text not null,
  address_note text,
  care_level int not null default 0 check (care_level between 0 and 5),
  device_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  medication_times jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index seniors_family_idx on seniors(family_id);

create table voice_sessions (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references seniors(id) on delete cascade,
  conversation_id text,
  summary text,
  mood session_mood,
  problem_category text,
  needs_human boolean not null default false,
  created_at timestamptz not null default now()
);
create index voice_sessions_senior_idx on voice_sessions(senior_id, created_at desc);
create unique index voice_sessions_conversation_idx on voice_sessions(conversation_id) where conversation_id is not null;

create table help_requests (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references seniors(id) on delete cascade,
  category help_category not null default 'other',
  summary text not null,
  status help_status not null default 'open',
  created_at timestamptz not null default now()
);
create index help_requests_senior_idx on help_requests(senior_id, created_at desc);

create table emergency_events (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references seniors(id) on delete cascade,
  level emergency_level not null,
  reason text not null,
  quote text,
  source emergency_source not null,
  status emergency_status not null default 'open',
  notified jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index emergency_events_senior_idx on emergency_events(senior_id, created_at desc);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role waitlist_role not null default 'other',
  city text,
  message text,
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------
alter table families enable row level security;
alter table relatives enable row level security;
alter table seniors enable row level security;
alter table voice_sessions enable row level security;
alter table help_requests enable row level security;
alter table emergency_events enable row level security;
alter table waitlist enable row level security;

-- Anonymous visitors may join the waitlist (insert only, never read).
create policy "waitlist_anon_insert" on waitlist for insert to anon with check (true);

-- Prototype: the family alerts page is a link-protected read-only view (the familyId is the secret).
-- Layer 2 replaces these with auth-based policies.
create policy "events_anon_read" on emergency_events for select to anon using (true);
create policy "help_requests_anon_read" on help_requests for select to anon using (true);
create policy "voice_sessions_anon_read" on voice_sessions for select to anon using (true);

-- ---------- realtime ----------
alter publication supabase_realtime add table emergency_events;
alter publication supabase_realtime add table help_requests;
alter publication supabase_realtime add table voice_sessions;
