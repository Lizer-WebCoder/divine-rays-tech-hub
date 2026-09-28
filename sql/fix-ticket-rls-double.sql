-- Fix: RLS error on create + ensure own tickets readable after insert
-- Run in Supabase → SQL Editor

DROP POLICY IF EXISTS "tickets_insert_customer" ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert" ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert_own" ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert_authenticated" ON public.tickets;

CREATE POLICY "tickets_insert_own" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
  );

DROP POLICY IF EXISTS "tickets_select" ON public.tickets;
DROP POLICY IF EXISTS "tickets_select_related" ON public.tickets;
DROP POLICY IF EXISTS "tickets_select_own" ON public.tickets;

CREATE POLICY "tickets_select" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );
