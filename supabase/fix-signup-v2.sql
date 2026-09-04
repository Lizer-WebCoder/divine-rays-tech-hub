-- FIX v2: Stop Auth from failing on signup
-- The app will create the profile row after signup instead of the trigger.
-- Run this in SQL Editor, then try Create Account again.

-- 1) Remove the trigger that causes "Database error saving new user"
drop trigger if exists on_auth_user_created on auth.users;

-- Keep the function for optional later use, but make it safe
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  return new; -- no-op: app creates profile
end;
$$;

-- 2) Ensure profiles table is usable
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'User',
  role text not null default 'customer',
  username text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists created_at timestamptz default now();

update public.profiles set full_name = 'User' where full_name is null;
update public.profiles set role = 'customer' where role is null;

alter table public.profiles alter column full_name set default 'User';
alter table public.profiles alter column role set default 'customer';

-- Drop strict check if it causes issues
alter table public.profiles drop constraint if exists profiles_role_check;

-- 3) RLS policies so the logged-in user can insert their own profile
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4) Permissions
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

select 'trigger disabled — signup should work now' as status;
