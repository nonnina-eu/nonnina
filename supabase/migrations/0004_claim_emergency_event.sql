-- Atomic open of an emergency event.
-- Two taps at once take one row: the lock is held for the check and the insert.
-- Called by SupabaseStore.claimEmergencyEvent (lib/db/supabase-store.ts).
-- Reads and writes emergency_events. No new columns.

create or replace function claim_emergency_event(
  p_senior_id uuid,
  p_level emergency_level,
  p_reason text,
  p_quote text,
  p_source emergency_source,
  p_since timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.emergency_events%rowtype;
  created public.emergency_events%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext(p_senior_id::text));

  select * into existing
  from public.emergency_events
  where senior_id = p_senior_id
    and status <> 'cancelled_by_senior'
    and created_at >= p_since
  order by created_at desc
  limit 1;

  if found and (existing.level = p_level or existing.level = 'emergency') then
    return jsonb_build_object('created', false, 'event', to_jsonb(existing));
  end if;

  insert into public.emergency_events (senior_id, level, reason, quote, source, status, notified)
  values (p_senior_id, p_level, p_reason, p_quote, p_source, 'open', '[]'::jsonb)
  returning * into created;

  return jsonb_build_object('created', true, 'event', to_jsonb(created));
end;
$$;

revoke all on function claim_emergency_event(uuid, emergency_level, text, text, emergency_source, timestamptz) from public, anon, authenticated;
grant execute on function claim_emergency_event(uuid, emergency_level, text, text, emergency_source, timestamptz) to service_role;
