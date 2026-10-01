-- Divine Rays — add staff_role for chosen Admin/Agent label (Admin, Owner, IT Tech Support)
-- Run once in Supabase SQL Editor

alter table public.profiles
  add column if not exists staff_role text;

alter table public.profiles
  add column if not exists email text;

-- Allow admin role (if still restricted to customer/agent only)
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
exception when undefined_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_role_check check (role in ('customer', 'agent', 'admin'));
exception when duplicate_object then null;
end $$;

-- Keep signup trigger writing staff_role from metadata when present
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, username, email, staff_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(new.email, ''),
    nullif(new.raw_user_meta_data->>'staff_role', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    username = coalesce(excluded.username, public.profiles.username),
    email = coalesce(excluded.email, public.profiles.email),
    staff_role = coalesce(excluded.staff_role, public.profiles.staff_role);
  return new;
end;
$$;
