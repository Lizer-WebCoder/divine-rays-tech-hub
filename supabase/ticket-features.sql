-- Divine Rays — internal notes, attachments, assign support
-- Run in Supabase SQL Editor

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;

DROP POLICY IF EXISTS "comments_select_related" ON public.comments;
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_select_visible" ON public.comments;

CREATE POLICY "comments_select_visible" ON public.comments
  FOR SELECT TO authenticated
  USING (
    public.my_role() IN ('agent', 'admin')
    OR (
      COALESCE(is_internal, false) = false
      AND EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = comments.ticket_id
          AND t.requester_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_visible" ON public.comments;

CREATE POLICY "comments_insert_visible" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    OR user_id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
  );

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

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id);
