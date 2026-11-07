-- Nonnina · 0003 help request "I'm on it"
-- A relative takes a non-urgent help request from the family feed; the senior tablet then
-- shows "Anna kümmert sich um: …". Mirrors HelpRequest.acknowledged_by / acknowledged_at
-- in lib/db/types.ts.

alter table help_requests
  add column acknowledged_by uuid references relatives(id) on delete set null,
  add column acknowledged_at timestamptz;

-- The tablet polls the latest acknowledged, unresolved request of its senior.
create index help_requests_ack_idx on help_requests(senior_id, acknowledged_at desc)
  where acknowledged_at is not null;
