-- Divine Rays — Admin user management policies
-- Run in Supabase SQL Editor

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.my_role() = 'admin')
  WITH CHECK (public.my_role() = 'admin');

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.my_role() = 'admin');

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Optional: fully remove login (replace UUID)
-- DELETE FROM auth.users WHERE id = 'USER-UUID-HERE';
