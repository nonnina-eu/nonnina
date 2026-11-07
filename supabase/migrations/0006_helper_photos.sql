-- Nonnina · 0006 helper photos + demo flag
-- photo_url: public profile photo (relative path like /helpers/<slug>.jpg or an absolute URL).
-- is_demo: true for seeded showcase profiles; the directory shows a "Demo profile" label.
-- Mirrors Helper.photo_url / Helper.is_demo in lib/db/types.ts.

alter table helpers add column photo_url text check (photo_url is null or char_length(photo_url) <= 500);
alter table helpers add column is_demo boolean not null default false;

-- Both are public: extend the column grant from 0005 (phone, email, user_id stay hidden).
grant select (photo_url, is_demo) on helpers to anon, authenticated;

-- Recreate the public view with the new columns (column list changes, so drop + create).
drop view if exists helpers_public;
create view helpers_public with (security_invoker = true) as
  select id, name, kind, city, bio, languages, services, hourly_rate_eur, verified, photo_url, is_demo, created_at
  from helpers
  where active;
grant select on helpers_public to anon, authenticated;
