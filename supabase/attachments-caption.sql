-- Divine Rays — optional caption/comment on attachments
-- Run in Supabase SQL Editor

ALTER TABLE public.ticket_attachments
  ADD COLUMN IF NOT EXISTS caption text;
