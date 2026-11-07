-- Nonnina · 0004 marketplace (Layer 3)
-- helpers: people, services and volunteers who offer help (shopping, cooking, company …).
-- helper_requests: a family asks a helper for a service; accept → contacts are shared,
-- linked help_requests go to status 'matched'.
-- Mirrors Helper / HelperRequest in lib/db/types.ts. Writes go through server actions /
-- routes with the service role only.

create type helper_kind as enum ('independent', 'service', 'volunteer');
create type helper_request_status as enum ('sent', 'accepted', 'declined', 'done');

create table helpers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  kind helper_kind not null default 'independent',
  city text not null,
  bio text not null default '',
  languages text[] not null default '{}',
  services text[] not null default '{}' check (
    services <@ array['shopping', 'cooking', 'company', 'household', 'transport', 'appointments',
                      'paperwork', 'personal_care', 'gardening', 'tech_help']::text[]
  ),
  hourly_rate_eur numeric(6, 2) check (hourly_rate_eur is null or hourly_rate_eur >= 0),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{6,14}$'),
  email text,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index helpers_user_idx on helpers(user_id) where user_id is not null;
create index helpers_city_idx on helpers(lower(city)) where active;
create index helpers_services_idx on helpers using gin (services);

create table helper_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  senior_id uuid not null references seniors(id) on delete cascade,
  helper_id uuid not null references helpers(id) on delete cascade,
  relative_id uuid references relatives(id) on delete set null,
  help_request_id uuid references help_requests(id) on delete set null,
  service text not null check (
    service in ('shopping', 'cooking', 'company', 'household', 'transport', 'appointments',
                'paperwork', 'personal_care', 'gardening', 'tech_help')
  ),
  message text not null default '' check (char_length(message) <= 600),
  preferred_time text check (preferred_time is null or char_length(preferred_time) <= 120),
  status helper_request_status not null default 'sent',
  notified jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index helper_requests_helper_idx on helper_requests(helper_id, created_at desc);
create index helper_requests_family_idx on helper_requests(family_id, created_at desc);

-- ---------- row level security ----------
alter table helpers enable row level security;
alter table helper_requests enable row level security;

-- Public directory: anyone may read active helpers, but only the safe columns.
-- Column privileges hide phone, email and user_id from anon / authenticated even with RLS.
revoke all on helpers from anon, authenticated;
grant select (id, name, kind, city, bio, languages, services, hourly_rate_eur, verified, active, created_at)
  on helpers to anon, authenticated;
create policy "helpers_public_read" on helpers
  for select to anon, authenticated
  using (active);

-- Convenience view for clients (and the voice agent later): same safe columns, active only.
create view helpers_public with (security_invoker = true) as
  select id, name, kind, city, bio, languages, services, hourly_rate_eur, verified, created_at
  from helpers
  where active;
grant select on helpers_public to anon, authenticated;

-- Helper requests: family members read their family's rows, a helper reads requests sent to them.
revoke all on helper_requests from anon;
create policy "helper_requests_family_read" on helper_requests
  for select to authenticated
  using (family_id in (select public.my_family_ids()));

create or replace function public.my_helper_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from helpers where user_id = auth.uid();
$$;
revoke all on function public.my_helper_ids() from public;
grant execute on function public.my_helper_ids() to authenticated;

create policy "helper_requests_helper_read" on helper_requests
  for select to authenticated
  using (helper_id in (select public.my_helper_ids()));

-- No insert / update / delete policies: writes use the service role (server actions).
