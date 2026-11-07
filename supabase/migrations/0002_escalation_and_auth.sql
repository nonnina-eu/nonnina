-- Nonnina · 0002 escalation ladder + family auth
-- Adds: families.fallback_phone, relatives.user_id (Supabase Auth link),
-- emergency_events escalation columns, help_requests.resolved_at,
-- and RLS policies for authenticated family members.

-- ---------- columns ----------
alter table families
  add column fallback_phone text check (fallback_phone is null or fallback_phone ~ '^\+[1-9][0-9]{6,14}$');

alter table relatives
  add column user_id uuid references auth.users(id) on delete set null;
create index relatives_user_idx on relatives(user_id);

alter table emergency_events
  add column escalation_step int not null default 0,
  add column next_step_at timestamptz,
  add column acknowledged_by uuid references relatives(id) on delete set null;
create index emergency_events_due_idx on emergency_events(status, next_step_at);

alter table help_requests
  add column resolved_at timestamptz;

-- ---------- auth helper ----------
-- Families the current auth user belongs to (through a relatives row).
create or replace function public.my_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from relatives where user_id = auth.uid();
$$;
revoke all on function public.my_family_ids() from public;
grant execute on function public.my_family_ids() to authenticated;

-- ---------- RLS for authenticated family members ----------
create policy "families_member_read" on families
  for select to authenticated
  using (id in (select public.my_family_ids()));

create policy "relatives_member_read" on relatives
  for select to authenticated
  using (family_id in (select public.my_family_ids()));

create policy "seniors_member_read" on seniors
  for select to authenticated
  using (family_id in (select public.my_family_ids()));

create policy "voice_sessions_member_read" on voice_sessions
  for select to authenticated
  using (senior_id in (select id from seniors where family_id in (select public.my_family_ids())));

create policy "help_requests_member_read" on help_requests
  for select to authenticated
  using (senior_id in (select id from seniors where family_id in (select public.my_family_ids())));

create policy "emergency_events_member_read" on emergency_events
  for select to authenticated
  using (senior_id in (select id from seniors where family_id in (select public.my_family_ids())));

-- Writes go through server routes (service role). These update policies are kept for future
-- browser-side acknowledge / resolve; they are not used today.
create policy "help_requests_member_update" on help_requests
  for update to authenticated
  using (senior_id in (select id from seniors where family_id in (select public.my_family_ids())))
  with check (senior_id in (select id from seniors where family_id in (select public.my_family_ids())));

create policy "emergency_events_member_update" on emergency_events
  for update to authenticated
  using (senior_id in (select id from seniors where family_id in (select public.my_family_ids())))
  with check (senior_id in (select id from seniors where family_id in (select public.my_family_ids())));

-- NOTE: the anon read policies from 0001 (events_anon_read, help_requests_anon_read,
-- voice_sessions_anon_read) stay in place because /demo still reads through the anon key.
-- Remove them in a later migration once the demo page uses a token-protected feed.

-- ---------- realtime ----------
-- Relatives are read by the family app; add them to the publication so settings refresh live.
alter publication supabase_realtime add table relatives;
