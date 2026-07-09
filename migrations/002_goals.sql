-- =============================================================
-- THE MIRROR — Migration 002: Goals Table
-- Adds the goals table with RLS.
-- Safe to re-run: uses IF NOT EXISTS guards.
-- =============================================================


-- =============================================================
-- 1. TABLE
-- =============================================================

create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users on delete cascade,
  pillar_type text not null check (pillar_type in ('soul', 'vessel', 'impact', 'stewardship')),
  title       text not null,
  is_done     boolean not null default false,
  -- status supersedes is_done; kept in sync via trigger below
  status      text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);


-- =============================================================
-- 2. ROW LEVEL SECURITY
-- =============================================================

alter table goals enable row level security;

drop policy if exists "Own goals only" on goals;
create policy "Own goals only" on goals
  for all using (auth.uid() = user_id);


-- =============================================================
-- 3. INDEXES
-- =============================================================

create index if not exists goals_status_idx on goals (user_id, status);


-- =============================================================
-- 4. TRIGGER: keep is_done in sync with status
-- Legacy field; maintained so any code checking is_done still works.
-- =============================================================

create or replace function sync_goal_is_done()
returns trigger as $$
begin
  new.is_done := (new.status = 'done');
  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_goal_is_done_trigger on goals;
create trigger sync_goal_is_done_trigger
  before insert or update on goals
  for each row execute function sync_goal_is_done();
