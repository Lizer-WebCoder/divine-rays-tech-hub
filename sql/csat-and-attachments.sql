-- ============================================================
-- Divine Rays — CSAT + Ticket Attachments
-- Run in Supabase → SQL Editor → Run
-- Then: Storage → New bucket → name: ticket-files → Private
-- ============================================================

-- ——— CSAT columns + RPC ———
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

-- ——— Attachments table ———
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size int,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_attachments_ticket_idx
  ON public.ticket_attachments (ticket_id);

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_select" ON public.ticket_attachments;
CREATE POLICY "attachments_select" ON public.ticket_attachments
  FOR SELECT TO authenticated
  USING (
    public.my_role() IN ('agent', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_attachments.ticket_id
        AND t.requester_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "attachments_insert" ON public.ticket_attachments;
CREATE POLICY "attachments_insert" ON public.ticket_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      public.my_role() IN ('agent', 'admin')
      OR EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_attachments.ticket_id
          AND t.requester_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "attachments_delete" ON public.ticket_attachments;
CREATE POLICY "attachments_delete" ON public.ticket_attachments
  FOR DELETE TO authenticated
  USING (
    public.my_role() IN ('agent', 'admin')
    OR uploaded_by = auth.uid()
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-files', 'ticket-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "ticket_files_select" ON storage.objects;
CREATE POLICY "ticket_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ticket-files');

DROP POLICY IF EXISTS "ticket_files_insert" ON storage.objects;
CREATE POLICY "ticket_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ticket-files');

DROP POLICY IF EXISTS "ticket_files_delete" ON storage.objects;
CREATE POLICY "ticket_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ticket-files');
