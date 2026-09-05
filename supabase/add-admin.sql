-- Divine Rays Tech Hub — Add Admin role
-- Run once in Supabase SQL Editor

-- 1) Allow role = admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'agent', 'admin'));

-- 2) my_role() helper (used by RLS)
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 3) Profiles policies — admins can list & update everyone
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_agents_list" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.my_role() = 'admin')
  WITH CHECK (public.my_role() = 'admin');

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4) Tickets — agents AND admins
DROP POLICY IF EXISTS "tickets_select" ON public.tickets;
CREATE POLICY "tickets_select" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS "tickets_update_agent" ON public.tickets;
CREATE POLICY "tickets_update_agent" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'))
  WITH CHECK (public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "tickets_insert_customer" ON public.tickets;
CREATE POLICY "tickets_insert_customer" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND public.my_role() = 'customer'
  );

-- 5) Comments — agents AND admins
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = comments.ticket_id
        AND (t.requester_id = auth.uid() OR public.my_role() IN ('agent', 'admin'))
    )
    AND (is_internal = false OR public.my_role() IN ('agent', 'admin'))
  );

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND (
          (t.requester_id = auth.uid() AND is_internal = false)
          OR public.my_role() IN ('agent', 'admin')
        )
    )
  );

-- 6) Promote YOUR account to admin
-- Find your UUID: Authentication → Users → copy User UID
-- Then uncomment and run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'PASTE-YOUR-UUID-HERE';

SELECT 'Admin role ready. Promote yourself with UPDATE profiles SET role = admin WHERE id = ...' AS status;
