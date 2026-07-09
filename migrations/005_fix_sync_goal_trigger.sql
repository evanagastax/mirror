-- =============================================================
-- THE MIRROR — Migration 005: Fix sync_goal_is_done security
--
-- The sync_goal_is_done() trigger function was defined without
-- SECURITY DEFINER, inconsistent with all other trigger functions
-- in this schema. Redefine it with SECURITY DEFINER for consistency.
-- Safe to re-run: uses CREATE OR REPLACE + DROP IF EXISTS.
-- =============================================================

create or replace function sync_goal_is_done()
returns trigger as $$
begin
  new.is_done := (new.status = 'done');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_goal_is_done_trigger on goals;
create trigger sync_goal_is_done_trigger
  before insert or update on goals
  for each row execute function sync_goal_is_done();
