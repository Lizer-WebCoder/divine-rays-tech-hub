-- Divine Rays — FIX ticket status updates
-- Supabase → SQL Editor → New query → Run all

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'customer'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_ticket_status(p_ticket_id uuid, p_status text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_new text;
BEGIN
  v_role := public.my_role();
  IF v_role IS NULL OR v_role NOT IN ('agent', 'admin') THEN
    RAISE EXCEPTION 'Only agents and admins can change status';
  END IF;

  v_new := trim(p_status);
  IF v_new = '' THEN
    RAISE EXCEPTION 'Status is required';
  END IF;

  UPDATE public.tickets
  SET status = v_new,
      updated_at = now()
  WHERE id = p_ticket_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  RETURN v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_ticket_status(uuid, text) TO authenticated;

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_update_staff" ON public.tickets;
CREATE POLICY "tickets_update_staff" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'))
  WITH CHECK (public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "tickets_select_staff" ON public.tickets;
CREATE POLICY "tickets_select_staff" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    public.my_role() IN ('agent', 'admin')
    OR requester_id = auth.uid()
  );

DO $$
BEGIN
  ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
