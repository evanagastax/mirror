-- =============================================================
-- THE MIRROR — Migration 004: Decrement pillar scores on delete
--
-- The existing INSERT triggers increment pillar scores when logs
-- and transactions are created. Without matching DELETE triggers,
-- deleting a log leaves the score permanently inflated.
--
-- These triggers mirror the INSERT logic in reverse.
-- Safe to re-run: uses CREATE OR REPLACE + DROP IF EXISTS.
-- =============================================================


-- =============================================================
-- 1. TRIGGER: decrement pillar when a log is deleted
-- Reverses the effect of update_pillar_from_log().
-- =============================================================

create or replace function decrement_pillar_from_log()
returns trigger as $$
begin
  update pillars
  set
    soul       = greatest(0, soul   - case when old.pillar_type = 'soul'   then old.value else 0 end),
    vessel     = greatest(0, vessel - case when old.pillar_type = 'vessel' then old.value else 0 end),
    impact     = greatest(0, impact - case when old.pillar_type = 'impact' then old.value else 0 end),
    updated_at = now()
  where user_id = old.user_id;

  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_log_delete on logs;
create trigger on_log_delete
  after delete on logs
  for each row execute function decrement_pillar_from_log();


-- =============================================================
-- 2. TRIGGER: decrement stewardship when a transaction is deleted
-- Reverses the effect of update_pillar_from_transaction().
-- =============================================================

create or replace function decrement_pillar_from_transaction()
returns trigger as $$
declare
  pts int;
begin
  pts := case old.category
    when 'investment'  then 2
    when 'consumption' then 1
    else 0  -- 'leak' was never awarded points
  end;

  update pillars
  set
    stewardship = greatest(0, stewardship - pts),
    updated_at  = now()
  where user_id = old.user_id;

  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_transaction_delete on transactions;
create trigger on_transaction_delete
  after delete on transactions
  for each row execute function decrement_pillar_from_transaction();
