-- Divine Rays Tech Hub v7.0 optional columns
-- Run in Supabase SQL Editor (safe to re-run)

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS satisfaction text
  CHECK (satisfaction IS NULL OR satisfaction IN ('up', 'down'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen timestamptz;

SELECT 'v7.0 columns ready' AS status;
