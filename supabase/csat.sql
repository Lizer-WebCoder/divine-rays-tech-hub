-- Divine Rays — CSAT (customer satisfaction)
-- Supabase → SQL Editor → Run

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS csat_score int;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS csat_comment text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS csat_at timestamptz;

CREATE OR REPLACE FUNCTION public.submit_csat(p_ticket_id uuid, p_score int, p_comment text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  IF p_score IS NULL OR p_score < 1 OR p_score > 5 THEN
    RAISE EXCEPTION 'Score must be 1–5';
  END IF;

  SELECT status INTO v_status FROM public.tickets
  WHERE id = p_ticket_id AND requester_id = auth.uid();

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Ticket not found or not yours';
  END IF;

  IF lower(trim(v_status)) NOT IN ('resolved','closed','solved','done','complete','completed') THEN
    RAISE EXCEPTION 'You can only rate resolved tickets';
  END IF;

  UPDATE public.tickets
  SET csat_score = p_score,
      csat_comment = NULLIF(trim(COALESCE(p_comment, '')), ''),
      csat_at = now()
  WHERE id = p_ticket_id
    AND requester_id = auth.uid();

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_csat(uuid, int, text) TO authenticated;
