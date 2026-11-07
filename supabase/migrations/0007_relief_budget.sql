-- Nonnina · 0007 relief budget (Entlastungsbetrag)
-- helpers.relief_eligible: the helper can be paid via the relief amount (131 €/month from care
--   level 1; in Baden-Württemberg only recognised "Angebote zur Unterstützung im Alltag" /
--   approved care services). Set by the Nonnina team, public like `verified`.
-- helper_requests: completion fields. A request in status 'done' with an amount is a completed,
--   billable job; the family dashboard sums these per month (lib/relief-budget.ts).
-- Mirrors Helper.relief_eligible and HelperRequest.hours / amount_eur / service_date / completed_at
-- in lib/db/types.ts.

alter table helpers add column relief_eligible boolean not null default false;

-- Public like verified: extend the column grant from 0005/0006 and recreate the public view.
grant select (relief_eligible) on helpers to anon, authenticated;

drop view if exists helpers_public;
create view helpers_public with (security_invoker = true) as
  select id, name, kind, city, bio, languages, services, hourly_rate_eur, verified, relief_eligible, photo_url, is_demo, created_at
  from helpers
  where active;
grant select on helpers_public to anon, authenticated;

alter table helper_requests
  add column hours numeric(5, 2) check (hours is null or (hours > 0 and hours <= 24)),
  add column amount_eur numeric(8, 2) check (amount_eur is null or amount_eur >= 0),
  add column service_date date,
  add column completed_at timestamptz;

-- Completion data only makes sense for finished jobs.
alter table helper_requests add constraint helper_requests_completion_done
  check (status = 'done' or (hours is null and amount_eur is null and service_date is null and completed_at is null));

create index helper_requests_done_idx on helper_requests(family_id, service_date) where status = 'done';

-- ---------- row level security ----------
-- The app writes with the service role (server actions check ownership). These policies let a
-- signed-in family member or helper record a completion directly as well: only the completion
-- columns are updatable, only on their own rows, and only to status 'done'.
-- Supabase grants table-wide update to authenticated by default: narrow it to these columns.
revoke insert, update, delete on helper_requests from authenticated;
grant update (status, hours, amount_eur, service_date, completed_at, updated_at) on helper_requests to authenticated;

create policy "helper_requests_family_complete" on helper_requests
  for update to authenticated
  using (family_id in (select public.my_family_ids()) and status in ('accepted', 'done'))
  with check (family_id in (select public.my_family_ids()) and status = 'done');

create policy "helper_requests_helper_complete" on helper_requests
  for update to authenticated
  using (helper_id in (select public.my_helper_ids()) and status in ('accepted', 'done'))
  with check (helper_id in (select public.my_helper_ids()) and status = 'done');
