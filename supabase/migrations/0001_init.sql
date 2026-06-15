-- ============================================================
-- Lattice — AI Decision Audit System
-- Supabase migration: schema, RLS, triggers
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================

-- Extensions ----------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------
do $$ begin
  create type decision_outcome as enum ('approved','rejected','flagged','pending','overridden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin','auditor','viewer');
exception when duplicate_object then null; end $$;

-- Profiles ------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  organization text,
  role user_role not null default 'auditor',
  created_at timestamptz not null default now()
);

-- Decisions -----------------------------------------------------
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_name text not null,
  model_version text,
  agent_name text,
  decision_type text not null,
  prompt text,
  response text,
  outcome decision_outcome not null default 'pending',
  risk_level risk_level not null default 'low',
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  tokens_input integer check (tokens_input is null or tokens_input >= 0),
  tokens_output integer check (tokens_output is null or tokens_output >= 0),
  cost_usd numeric(10,6) check (cost_usd is null or cost_usd >= 0),
  tags text[],
  metadata jsonb,
  reviewer_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists decisions_user_idx on public.decisions(user_id);
create index if not exists decisions_created_idx on public.decisions(created_at desc);
create index if not exists decisions_outcome_idx on public.decisions(outcome);
create index if not exists decisions_risk_idx on public.decisions(risk_level);
create index if not exists decisions_model_idx on public.decisions(model_name);
create index if not exists decisions_tags_idx on public.decisions using gin(tags);
create index if not exists decisions_metadata_idx on public.decisions using gin(metadata);

-- Audit event log (append-only) --------------------------------
create table if not exists public.decision_events (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists decision_events_decision_idx
  on public.decision_events(decision_id, created_at desc);

-- Row Level Security -------------------------------------------
alter table public.profiles enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_events enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- decisions policies
drop policy if exists "decisions_select_own" on public.decisions;
create policy "decisions_select_own" on public.decisions
  for select using (auth.uid() = user_id);

drop policy if exists "decisions_insert_own" on public.decisions;
create policy "decisions_insert_own" on public.decisions
  for insert with check (auth.uid() = user_id);

drop policy if exists "decisions_update_own" on public.decisions;
create policy "decisions_update_own" on public.decisions
  for update using (auth.uid() = user_id);

drop policy if exists "decisions_delete_own" on public.decisions;
create policy "decisions_delete_own" on public.decisions
  for delete using (auth.uid() = user_id);

-- decision_events policies (immutable from client side)
drop policy if exists "events_select_own" on public.decision_events;
create policy "events_select_own" on public.decision_events
  for select using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "events_insert_own" on public.decision_events;
create policy "events_insert_own" on public.decision_events
  for insert with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = auth.uid()
    )
  );

-- No update / delete policies for decision_events: append-only.

-- Triggers ------------------------------------------------------

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, organization)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'organization', null)
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Append a "created" event whenever a decision is inserted
create or replace function public.log_decision_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.decision_events (decision_id, actor_id, action, details)
  values (
    new.id,
    new.user_id,
    'decision.created',
    jsonb_build_object(
      'outcome', new.outcome,
      'risk_level', new.risk_level,
      'model_name', new.model_name,
      'model_version', new.model_version
    )
  );
  return new;
end; $$;

drop trigger if exists trg_log_decision_created on public.decisions;
create trigger trg_log_decision_created
after insert on public.decisions
for each row execute function public.log_decision_created();

-- Append an event when meaningful fields change
create or replace function public.log_decision_updated()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  changes jsonb := '{}'::jsonb;
begin
  if new.outcome is distinct from old.outcome then
    changes := changes || jsonb_build_object('outcome', jsonb_build_object('from', old.outcome, 'to', new.outcome));
  end if;
  if new.risk_level is distinct from old.risk_level then
    changes := changes || jsonb_build_object('risk_level', jsonb_build_object('from', old.risk_level, 'to', new.risk_level));
  end if;
  if new.reviewer_notes is distinct from old.reviewer_notes then
    changes := changes || jsonb_build_object('reviewer_notes_changed', true);
  end if;

  if changes <> '{}'::jsonb then
    insert into public.decision_events (decision_id, actor_id, action, details)
    values (new.id, auth.uid(), 'decision.updated', changes);
  end if;
  return new;
end; $$;

drop trigger if exists trg_log_decision_updated on public.decisions;
create trigger trg_log_decision_updated
after update on public.decisions
for each row execute function public.log_decision_updated();

-- Views for Display -----------------------------------------------
create or replace view public.decisions_display as
select 
  d.id,
  d.model_name,
  d.decision_type,
  d.outcome,
  d.risk_level,
  d.confidence,
  d.created_at,
  p.email as reviewer_email,
  d.tags,
  d.cost_usd
from public.decisions d
left join public.profiles p on d.user_id = p.id
order by d.created_at desc;
