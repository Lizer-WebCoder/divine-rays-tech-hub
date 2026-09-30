-- Divine Rays Tech Log — Phase 2 schema (Borrow & Return)
-- Run in Supabase SQL Editor (safe to re-run)
-- Credit: Boyz at the Back LRK · All Rights Reserved

CREATE TABLE IF NOT EXISTS public.tl_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  branch text,
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'borrowed', 'maintenance', 'retired')),
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tl_assets_tag_unique ON public.tl_assets (lower(tag));
CREATE INDEX IF NOT EXISTS tl_assets_status_idx ON public.tl_assets (status);
CREATE INDEX IF NOT EXISTS tl_assets_branch_idx ON public.tl_assets (branch);

CREATE TABLE IF NOT EXISTS public.tl_borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.tl_assets(id) ON DELETE RESTRICT,
  borrower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'returned', 'rejected', 'overdue')),
  borrowed_at timestamptz,
  due_at timestamptz,
  returned_at timestamptz,
  purpose text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tl_borrows_borrower_idx ON public.tl_borrows (borrower_id);
CREATE INDEX IF NOT EXISTS tl_borrows_asset_idx ON public.tl_borrows (asset_id);
CREATE INDEX IF NOT EXISTS tl_borrows_status_idx ON public.tl_borrows (status);

CREATE OR REPLACE FUNCTION public.tl_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tl_assets_updated_at ON public.tl_assets;
CREATE TRIGGER tl_assets_updated_at
  BEFORE UPDATE ON public.tl_assets
  FOR EACH ROW EXECUTE FUNCTION public.tl_set_updated_at();

DROP TRIGGER IF EXISTS tl_borrows_updated_at ON public.tl_borrows;
CREATE TRIGGER tl_borrows_updated_at
  BEFORE UPDATE ON public.tl_borrows
  FOR EACH ROW EXECUTE FUNCTION public.tl_set_updated_at();

ALTER TABLE public.tl_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tl_borrows ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tl_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS tl_assets_select ON public.tl_assets;
CREATE POLICY tl_assets_select ON public.tl_assets
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS tl_assets_insert_staff ON public.tl_assets;
CREATE POLICY tl_assets_insert_staff ON public.tl_assets
  FOR INSERT TO authenticated
  WITH CHECK (public.tl_my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS tl_assets_update_staff ON public.tl_assets;
CREATE POLICY tl_assets_update_staff ON public.tl_assets
  FOR UPDATE TO authenticated
  USING (public.tl_my_role() IN ('agent', 'admin'))
  WITH CHECK (public.tl_my_role() IN ('agent', 'admin'));

DROP POLICY IF EXISTS tl_assets_delete_admin ON public.tl_assets;
CREATE POLICY tl_assets_delete_admin ON public.tl_assets
  FOR DELETE TO authenticated
  USING (public.tl_my_role() = 'admin');

DROP POLICY IF EXISTS tl_borrows_select ON public.tl_borrows;
CREATE POLICY tl_borrows_select ON public.tl_borrows
  FOR SELECT TO authenticated
  USING (
    borrower_id = auth.uid()
    OR public.tl_my_role() IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS tl_borrows_insert ON public.tl_borrows;
CREATE POLICY tl_borrows_insert ON public.tl_borrows
  FOR INSERT TO authenticated
  WITH CHECK (
    borrower_id = auth.uid()
    OR public.tl_my_role() IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS tl_borrows_update ON public.tl_borrows;
CREATE POLICY tl_borrows_update ON public.tl_borrows
  FOR UPDATE TO authenticated
  USING (
    borrower_id = auth.uid()
    OR public.tl_my_role() IN ('agent', 'admin')
  )
  WITH CHECK (
    borrower_id = auth.uid()
    OR public.tl_my_role() IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS tl_borrows_delete_admin ON public.tl_borrows;
CREATE POLICY tl_borrows_delete_admin ON public.tl_borrows
  FOR DELETE TO authenticated
  USING (public.tl_my_role() = 'admin');
