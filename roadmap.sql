create table if not exists goals (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users on delete cascade,
  pillar_type  text not null check (pillar_type in ('soul', 'vessel', 'impact', 'stewardship')),
  title        text not null,
  is_done      boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

alter table goals enable row level security;
create policy "Own goals only" on goals for all using (auth.uid() = user_id);
