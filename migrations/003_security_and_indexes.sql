-- =============================================================
-- THE MIRROR — Migration 003: Security Hardening & Indexes
-- Rate limits, field length constraints, query indexes.
-- Safe to re-run: uses OR REPLACE / IF NOT EXISTS / DROP IF EXISTS.
-- =============================================================


-- =============================================================
-- 1. FIELD LENGTH CONSTRAINTS
-- Prevent oversized payloads reaching the DB.
-- =============================================================

alter table transactions
  drop constraint if exists note_length_limit;
alter table transactions
  add constraint note_length_limit check (length(note) < 500);

alter table logs
  drop constraint if exists metadata_size_limit;
alter table logs
  add constraint metadata_size_limit check (length(metadata::text) < 10000);

alter table goals
  drop constraint if exists title_length_limit;
alter table goals
  add constraint title_length_limit check (length(title) < 300);

alter table profiles
  drop constraint if exists username_length_limit;
alter table profiles
  add constraint username_length_limit check (length(username) < 50);


-- =============================================================
-- 2. RATE LIMIT: logs — max 100 per user per day
-- Throws a clear error the client can surface directly.
-- =============================================================

create or replace function check_log_rate_limit()
returns trigger as $$
declare
  log_count int;
begin
  select count(*) into log_count
  from logs
  where user_id = new.user_id
    and created_at > now() - interval '1 day';

  if log_count >= 100 then
    raise exception 'Rate limit: maximum 100 logs per day reached.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_log_rate_limit on logs;
create trigger enforce_log_rate_limit
  before insert on logs
  for each row execute function check_log_rate_limit();


-- =============================================================
-- 3. RATE LIMIT: transactions — max 200 per user per day
-- =============================================================

create or replace function check_transaction_rate_limit()
returns trigger as $$
declare
  tx_count int;
begin
  select count(*) into tx_count
  from transactions
  where user_id = new.user_id
    and created_at > now() - interval '1 day';

  if tx_count >= 200 then
    raise exception 'Rate limit: maximum 200 transactions per day reached.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_transaction_rate_limit on transactions;
create trigger enforce_transaction_rate_limit
  before insert on transactions
  for each row execute function check_transaction_rate_limit();


-- =============================================================
-- 4. INDEXES
-- Speed up the streak query and filtered log queries.
-- =============================================================

-- Streak query: all logs for a user ordered by date
create index if not exists logs_user_date_idx
  on logs (user_id, created_at desc);

-- Filtered log query: per-pillar activity list
create index if not exists logs_user_pillar_idx
  on logs (user_id, pillar_type, created_at desc);


-- =============================================================
-- 5. CLEANUP: remove any github tokens stored in privacy_settings
-- Leftover from a removed GitHub sync feature.
-- =============================================================

update profiles
set privacy_settings = privacy_settings
  - 'github_token'
  - 'github_username'
where privacy_settings ? 'github_token'
   or privacy_settings ? 'github_username';
