-- The `waitlist` table lives in the shared Supabase project and is created by the
-- app repo migration (nonnina-eu/app: supabase/migrations/0001_init.sql).
-- Use this file only if you run the website against its own project.
do $$ begin
  create type waitlist_role as enum ('family', 'helper', 'care_service', 'other');
exception when duplicate_object then null; end $$;
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role waitlist_role not null default 'other',
  city text,
  message text,
  created_at timestamptz not null default now()
);
alter table waitlist enable row level security;
