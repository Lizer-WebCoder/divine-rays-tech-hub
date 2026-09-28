-- =============================================================================
-- Divine Rays Tech Hub — Daily ticket quota (UTC calendar day)
-- Stack: Supabase Postgres only (no Redis / extra services)
-- Default: 5 tickets per end-user per UTC day. Agents & admins are exempt.
-- Run in: Supabase → SQL Editor → Run
-- Credit: Boyz at the Back LRK · All Rights Reserved
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value)
VALUES ('ticket_quota', jsonb_build_object('daily_limit', 5, 'exempt_roles', jsonb_build_array('agent', 'admin')))
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_tickets_requester_created
  ON public.tickets (requester_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.ticket_count_today(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.tickets
  WHERE requester_id = p_user_id
    AND created_at >= (date_trunc('day', now() AT TIME ZONE 'UTC') AT timestamptz);
$$;

CREATE OR REPLACE FUNCTION public.enforce_ticket_daily_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit int := 5;
  v_exempt jsonb := '["agent","admin"]'::jsonb;
  v_role text;
  v_count int;
  v_settings jsonb;
BEGIN
  IF NEW.requester_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_settings
  FROM public.app_settings
  WHERE key = 'ticket_quota';

  IF v_settings IS NOT NULL THEN
    v_limit := COALESCE((v_settings->>'daily_limit')::int, 5);
    IF v_settings ? 'exempt_roles' THEN
      v_exempt := v_settings->'exempt_roles';
    END IF;
  END IF;

  BEGIN
    v_role := public.my_role();
  EXCEPTION WHEN OTHERS THEN
    v_role := NULL;
  END;

  IF v_role IS NOT NULL AND v_exempt ? v_role THEN
    RETURN NEW;
  END IF;

  v_count := public.ticket_count_today(NEW.requester_id);

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'TICKET_QUOTA_EXCEEDED: Daily limit of % ticket(s) reached. Try again after 00:00 UTC.', v_limit
      USING ERRCODE = 'P0001',
            HINT = 'quota_exceeded',
            DETAIL = format('used=%s limit=%s', v_count, v_limit);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ticket_daily_quota ON public.tickets;
CREATE TRIGGER trg_ticket_daily_quota
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ticket_daily_quota();

CREATE OR REPLACE FUNCTION public.get_my_ticket_quota()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit int := 5;
  v_exempt jsonb := '["agent","admin"]'::jsonb;
  v_role text;
  v_count int;
  v_settings jsonb;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  SELECT value INTO v_settings FROM public.app_settings WHERE key = 'ticket_quota';
  IF v_settings IS NOT NULL THEN
    v_limit := COALESCE((v_settings->>'daily_limit')::int, 5);
    IF v_settings ? 'exempt_roles' THEN
      v_exempt := v_settings->'exempt_roles';
    END IF;
  END IF;

  BEGIN
    v_role := public.my_role();
  EXCEPTION WHEN OTHERS THEN
    v_role := NULL;
  END;

  v_count := public.ticket_count_today(v_uid);

  RETURN jsonb_build_object(
    'limit', v_limit,
    'used', v_count,
    'remaining', GREATEST(v_limit - v_count, 0),
    'exempt', (v_role IS NOT NULL AND v_exempt ? v_role),
    'resets_at', (date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day')::timestamptz,
    'role', v_role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.ticket_count_today(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_ticket_quota() TO authenticated;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_settings_select_auth" ON public.app_settings;
CREATE POLICY "app_settings_select_auth" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);

-- Change limit later:
-- UPDATE public.app_settings
-- SET value = jsonb_build_object('daily_limit', 10, 'exempt_roles', '["agent","admin"]'::jsonb),
--     updated_at = now()
-- WHERE key = 'ticket_quota';
