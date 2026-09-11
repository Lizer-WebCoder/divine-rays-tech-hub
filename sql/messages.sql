-- Divine Rays — direct messages (safe / idempotent)
-- Run this whole script in Supabase SQL Editor

-- 1) Create table if missing
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Add columns if an older/empty messages table exists without them
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3) Backfill defaults where needed
UPDATE public.messages SET body = '' WHERE body IS NULL;

-- 4) FK constraints (ignore if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_sender_id_fkey
      FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'sender FK skipped: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_recipient_id_fkey'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_recipient_id_fkey
      FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'recipient FK skipped: %', SQLERRM;
END $$;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_pair_idx ON public.messages (sender_id, recipient_id, created_at DESC);

-- 6) RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "messages_update_recipient" ON public.messages;
CREATE POLICY "messages_update_recipient" ON public.messages
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- 7) Profiles visibility for messaging directory
DROP POLICY IF EXISTS "profiles_select_messaging" ON public.profiles;
CREATE POLICY "profiles_select_messaging" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.my_role() IN ('agent', 'admin')
    OR (
      public.my_role() = 'customer'
      AND role IN ('agent', 'admin')
    )
  );
