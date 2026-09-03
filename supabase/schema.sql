-- Divine Rays Tech Hub — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('customer', 'agent')),
  username text unique,
  created_at timestamptz not null default now()
);

-- Ticket number sequence
create sequence if not exists public.ticket_number_seq start 1001;

-- Tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  title text not null,
  description text not null,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  category text not null default 'Other',
  status text not null default 'Open'
    check (status in ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed')),
  requester_id uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments / activity
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  is_internal boolean not null default false,
  status_change text,
  created_at timestamptz not null default now()
);

create index if not exists tickets_requester_idx on public.tickets(requester_id);
create index if not exists tickets_assigned_idx on public.tickets(assigned_to);
create index if not exists tickets_status_idx on public.tickets(status);
create index if not exists comments_ticket_idx on public.comments(ticket_id);

create or replace function public.set_ticket_number()
returns trigger language plpgsql as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number := 'DR-' || nextval('public.ticket_number_seq')::text;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ticket_number on public.tickets;
create trigger trg_ticket_number
  before insert on public.tickets
  for each row execute function public.set_ticket_number();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_tickets_updated on public.tickets;
create trigger trg_tickets_updated
  before update on public.tickets
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    nullif(new.raw_user_meta_data->>'username', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.comments enable row level security;

create or replace function public.my_role()
returns text language sql stable
security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.my_role() = 'agent');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "tickets_select" on public.tickets;
create policy "tickets_select" on public.tickets
  for select to authenticated
  using (requester_id = auth.uid() or public.my_role() = 'agent');

drop policy if exists "tickets_insert_customer" on public.tickets;
create policy "tickets_insert_customer" on public.tickets
  for insert to authenticated
  with check (requester_id = auth.uid() and public.my_role() = 'customer');

drop policy if exists "tickets_update_agent" on public.tickets;
create policy "tickets_update_agent" on public.tickets
  for update to authenticated
  using (public.my_role() = 'agent') with check (public.my_role() = 'agent');

drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = comments.ticket_id
        and (t.requester_id = auth.uid() or public.my_role() = 'agent')
    )
    and (is_internal = false or public.my_role() = 'agent')
  );

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and ((t.requester_id = auth.uid() and is_internal = false) or public.my_role() = 'agent')
    )
  );

drop policy if exists "profiles_agents_list" on public.profiles;
create policy "profiles_agents_list" on public.profiles
  for select to authenticated
  using (role = 'agent' or id = auth.uid());
