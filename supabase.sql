-- =============================================================
-- THE MIRROR — Supabase Schema
-- Run this entire file in the Supabase SQL editor (once, on a
-- fresh project). Safe to re-run: uses IF NOT EXISTS guards.
-- =============================================================


-- =============================================================
-- 1. EXTENSIONS
-- =============================================================
create extension if not exists "uuid-ossp";


-- =============================================================
-- 2. TABLES
-- =============================================================

-- Profiles (one row per user, created automatically on signup)
create table if not exists profiles (
  id             uuid references auth.users on delete cascade primary key,
  username       text unique,
  avatar_url     text,
  privacy_settings jsonb not null default '{
    "gym": false,
    "spirit": false,
    "impact": false
  }'::jsonb,
  created_at     timestamptz not null default now()
);

-- Pillars / Compass stats (one row per user, all start at 0)
create table if not exists pillars (
  user_id        uuid references auth.users on delete cascade primary key,
  soul           int not null default 0,
  vessel         int not null default 0,
  impact         int not null default 0,
  stewardship    int not null default 0,
  updated_at     timestamptz not null default now()
);

-- Activity logs (soul / vessel / impact entries feed the trigger)
create table if not exists logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users on delete cascade,
  pillar_type    text not null check (pillar_type in ('soul', 'vessel', 'impact')),
  value          int not null check (value > 0),
  evidence_url   text,
  metadata       jsonb,
  created_at     timestamptz not null default now()
);

-- Financial ledger (manual-entry only; stewardship auto-updates from here)
create table if not exists transactions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users on delete cascade,
  amount         numeric(12, 2) not null,
  category       text not null check (category in ('investment', 'consumption', 'leak')),
  note           text,
  created_at     timestamptz not null default now()
);


-- =============================================================
-- 3. ROW LEVEL SECURITY
-- Every table is locked down so users only see their own data.
-- =============================================================

alter table profiles      enable row level security;
alter table pillars       enable row level security;
alter table logs          enable row level security;
alter table transactions  enable row level security;

-- profiles
create policy "Own profile only" on profiles
  for all using (auth.uid() = id);

-- pillars
create policy "Own pillars only" on pillars
  for all using (auth.uid() = user_id);

-- logs
create policy "Own logs only" on logs
  for all using (auth.uid() = user_id);

-- transactions — deliberately no social sharing, ever
create policy "Own transactions only" on transactions
  for all using (auth.uid() = user_id);


-- =============================================================
-- 4. TRIGGER: create profile + pillars row on new signup
-- Solves the "blank screen on first login" gap: as soon as a
-- user signs up via Supabase Auth, both rows are inserted so
-- the Compass screen always has something to fetch.
-- =============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
    values (new.id)
    on conflict (id) do nothing;

  insert into public.pillars (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate so re-running this file is safe
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- =============================================================
-- 5. TRIGGER: update pillar stats when a log is inserted
-- Soul / Vessel / Impact accumulate from the logs table.
-- =============================================================

create or replace function update_pillar_from_log()
returns trigger as $$
begin
  update pillars
  set
    soul    = soul    + case when new.pillar_type = 'soul'   then new.value else 0 end,
    vessel  = vessel  + case when new.pillar_type = 'vessel' then new.value else 0 end,
    impact  = impact  + case when new.pillar_type = 'impact' then new.value else 0 end,
    updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_log_insert on logs;
create trigger on_log_insert
  after insert on logs
  for each row execute function update_pillar_from_log();


-- =============================================================
-- 6. TRIGGER: update Stewardship from transactions
-- investment = +2 pts, consumption = +1 pt, leak = 0 pts.
-- Adjust the weights here once you know what feels right.
-- =============================================================

create or replace function update_pillar_from_transaction()
returns trigger as $$
declare
  pts int;
begin
  pts := case new.category
    when 'investment'  then 2
    when 'consumption' then 1
    else 0  -- 'leak' adds nothing (you still logged it, good habit)
  end;

  update pillars
  set
    stewardship = stewardship + pts,
    updated_at  = now()
  where user_id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_transaction_insert on transactions;
create trigger on_transaction_insert
  after insert on transactions
  for each row execute function update_pillar_from_transaction();


-- =============================================================
-- 7. REALTIME (optional but nice)
-- Enables the Compass to live-update the instant a log fires
-- the trigger, without needing a manual refetch.
-- =============================================================

alter publication supabase_realtime add table pillars;
