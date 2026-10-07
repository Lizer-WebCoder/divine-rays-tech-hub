-- Divine Rays: staff can see all tickets (End-User submissions included)
-- Run this in Supabase SQL Editor if Admin/Developer All Tickets is incomplete.

-- SELECT: customers see own tickets; agent + admin see all
DROP POLICY IF EXISTS "tickets_select" ON public.tickets;
CREATE POLICY "tickets_select" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );

-- INSERT: customers create tickets as requester
DROP POLICY IF EXISTS "tickets_insert_customer" ON public.tickets;
CREATE POLICY "tickets_insert_customer" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND public.my_role() = 'customer'
  );

-- UPDATE: staff can update any ticket
DROP POLICY IF EXISTS "tickets_update_agent" ON public.tickets;
DROP POLICY IF EXISTS "tickets_update_staff" ON public.tickets;
CREATE POLICY "tickets_update_staff" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'))
  WITH CHECK (public.my_role() IN ('agent', 'admin'));

-- Comments: staff can read all comments on tickets they can see
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = comments.ticket_id
        AND (
          t.requester_id = auth.uid()
          OR public.my_role() IN ('agent', 'admin')
        )
    )
    AND (is_internal = false OR public.my_role() IN ('agent', 'admin'))
  );
