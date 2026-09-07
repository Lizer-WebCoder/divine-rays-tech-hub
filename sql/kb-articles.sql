-- Divine Rays — Knowledge Base / FAQ
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'Other',
  published boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_select_published" ON public.kb_articles;
CREATE POLICY "kb_select_published" ON public.kb_articles
  FOR SELECT TO authenticated
  USING (published = true OR public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "kb_insert_staff" ON public.kb_articles;
CREATE POLICY "kb_insert_staff" ON public.kb_articles
  FOR INSERT TO authenticated
  WITH CHECK (public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "kb_update_staff" ON public.kb_articles;
CREATE POLICY "kb_update_staff" ON public.kb_articles
  FOR UPDATE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'))
  WITH CHECK (public.my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS "kb_delete_staff" ON public.kb_articles;
CREATE POLICY "kb_delete_staff" ON public.kb_articles
  FOR DELETE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'));
