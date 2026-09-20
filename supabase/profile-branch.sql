-- Divine Rays — branch field for customer profiles
-- Run in Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch text;
