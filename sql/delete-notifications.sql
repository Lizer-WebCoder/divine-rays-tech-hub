-- Divine Rays Tech Hub — delete tickets + in-app notifications
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text DEFAULT 'info',
  title text,
  body text NOT NULL,
  ticket_number text,
  meta jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications (user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_staff" ON public.notifications;
CREATE POLICY "notifications_insert_staff" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.my_role() IN ('agent', 'admin')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "tickets_delete_staff" ON public.tickets;
CREATE POLICY "tickets_delete_staff" ON public.tickets
  FOR DELETE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "comments_delete_staff" ON public.comments;
CREATE POLICY "comments_delete_staff" ON public.comments
  FOR DELETE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'));
