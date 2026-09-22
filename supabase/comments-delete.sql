-- Divine Rays — allow deleting notes/comments
-- Run in Supabase SQL Editor

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "comments_delete_staff" ON public.comments;
CREATE POLICY "comments_delete_staff" ON public.comments
  FOR DELETE TO authenticated
  USING (public.my_role() IN ('agent', 'admin'));
