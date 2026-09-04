-- Fix: "Database error saving new user" on signup
-- Run this entire script in Supabase SQL Editor

-- 1) Make sure profiles columns are correct and flexible
alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists role text;

alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  add column if not exists created_at timestamptz default now();

-- Allow nulls temporarily then backfill (avoids NOT NULL failures)
update public.profiles set full_name = coalesce(full_name, 'User') where full_name is null;
update public.profiles set role = coalesce(role, 'customer') where role is null;

alter table public.profiles alter column full_name set default 'User';
alter table public.profiles alter column role set default 'customer';

-- 2) Drop broken role check if it blocks inserts, re-add safely
alter table public.profiles drop constraint if exists profiles_role_check;

do $$
begin
  alter table public.profiles
    add constraint profiles_role_check check (role in ('customer', 'agent'));
exception
  when others then null;
end $$;

-- 3) Robust signup trigger (this is usually the failure point)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role text;
  v_username text;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'User');
  v_role := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'customer');
  if v_role not in ('customer', 'agent') then
    v_role := 'customer';
  end if;
  v_username := nullif(trim(new.raw_user_meta_data->>'username'), '');

  insert into public.profiles (id, full_name, role, username)
  values (new.id, v_name, v_role, v_username)
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    username = coalesce(excluded.username, public.profiles.username);

  return new;
exception
  when others then
    -- Log-friendly: still fail visibly in Auth if needed, but try not to block
    raise exception 'profile insert failed: %', sqlerrm;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.profiles to postgres, service_role;
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant all on table public.tickets to postgres, service_role;
grant select, insert, update on table public.tickets to authenticated;

grant all on table public.comments to postgres, service_role;
grant select, insert on table public.comments to authenticated;

grant usage, select on sequence public.ticket_number_seq to authenticated, service_role;

-- 5) RLS: allow trigger (security definer) + normal app access
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.my_role() = 'agent' or role = 'agent');

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Ensure my_role exists
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

select 'signup fix applied' as status;
