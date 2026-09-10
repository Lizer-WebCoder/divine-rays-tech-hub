-- Allow agents/admins to update ticket status
DROP POLICY IF EXISTS "tickets_update_staff" ON public.tickets;
CREATE POLICY "tickets_update_staff" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'))
  WITH CHECK (public.my_role() IN ('agent', 'admin'));
