-- ============================================================
-- Divine Rays — Private notes (harden) + Audit log + Idle SLA
-- Run in Supabase → SQL Editor → Run
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- Credit: Boyz at the Back LRK · All Rights Reserved
-- ============================================================

-- ---------- 1) Private / internal notes on comments ----------
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;

COMMENT ON COLUMN public.comments.is_internal IS
  'true = agent/admin only; end-users must never see these rows';

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
    AND (
      COALESCE(is_internal, false) = false
      OR public.my_role() IN ('agent', 'admin')
    )
  );

-- ---------- 2) Ticket activity / audit log ----------
CREATE TABLE IF NOT EXISTS public.ticket_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_activity_ticket_idx
  ON public.ticket_activity (ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ticket_activity_actor_idx
  ON public.ticket_activity (actor_id, created_at DESC);

ALTER TABLE public.ticket_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_activity_select" ON public.ticket_activity;
CREATE POLICY "ticket_activity_select" ON public.ticket_activity
  FOR SELECT TO authenticated
  USING (
    public.my_role() IN ('agent', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_activity.ticket_id
        AND t.requester_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ticket_activity_insert_staff" ON public.ticket_activity;
CREATE POLICY "ticket_activity_insert_staff" ON public.ticket_activity
  FOR INSERT TO authenticated
  WITH CHECK (public.my_role() IN ('agent', 'admin') OR actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.log_ticket_activity(
  p_ticket_id uuid,
  p_action text,
  p_detail text DEFAULT NULL,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
  VALUES (p_ticket_id, auth.uid(), p_action, p_detail, COALESCE(p_meta, '{}'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_ticket_activity(uuid, text, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.trg_tickets_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_detail text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      v_detail := COALESCE(OLD.status, '?') || ' → ' || COALESCE(NEW.status, '?');
      INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
      VALUES (
        NEW.id,
        auth.uid(),
        'status_change',
        v_detail,
        jsonb_build_object('from', OLD.status, 'to', NEW.status)
      );
    END IF;

    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
      INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
      VALUES (
        NEW.id,
        auth.uid(),
        'assign',
        'Assignee changed',
        jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to)
      );
    END IF;

    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
      INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
      VALUES (
        NEW.id,
        auth.uid(),
        'priority_change',
        COALESCE(OLD.priority, '?') || ' → ' || COALESCE(NEW.priority, '?'),
        jsonb_build_object('from', OLD.priority, 'to', NEW.priority)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tickets_audit_trg ON public.tickets;
CREATE TRIGGER tickets_audit_trg
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_tickets_audit();

CREATE OR REPLACE FUNCTION public.trg_comments_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
  VALUES (
    NEW.ticket_id,
    NEW.author_id,
    CASE WHEN COALESCE(NEW.is_internal, false) THEN 'internal_note' ELSE 'public_reply' END,
    left(NEW.body, 120),
    jsonb_build_object('comment_id', NEW.id, 'is_internal', COALESCE(NEW.is_internal, false))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_audit_trg ON public.comments;
CREATE TRIGGER comments_audit_trg
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_comments_audit();

-- ---------- 3) SLA helpers + idle escalation ----------
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS last_agent_activity_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS escalation_level int DEFAULT 0;

CREATE OR REPLACE FUNCTION public.trg_touch_agent_activity_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.my_role() IN ('agent', 'admin') OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = NEW.author_id AND p.role IN ('agent', 'admin')
  ) THEN
    UPDATE public.tickets
    SET last_agent_activity_at = now()
    WHERE id = NEW.ticket_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_touch_agent_activity ON public.comments;
CREATE TRIGGER comments_touch_agent_activity
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_touch_agent_activity_comment();

CREATE OR REPLACE FUNCTION public.escalate_idle_tickets(p_idle_hours int DEFAULT 24)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int := 0;
BEGIN
  IF public.my_role() NOT IN ('agent', 'admin') THEN
    RAISE EXCEPTION 'Only staff can escalate idle tickets';
  END IF;

  WITH candidates AS (
    SELECT id, priority
    FROM public.tickets
    WHERE lower(COALESCE(status, '')) NOT IN ('resolved', 'closed', 'solved', 'done', 'complete', 'completed')
      AND COALESCE(last_agent_activity_at, created_at) < (now() - make_interval(hours => GREATEST(p_idle_hours, 1)))
      AND COALESCE(escalation_level, 0) < 2
  ),
  upd AS (
    UPDATE public.tickets t
    SET
      escalation_level = COALESCE(t.escalation_level, 0) + 1,
      escalated_at = now(),
      priority = CASE
        WHEN lower(COALESCE(t.priority, '')) IN ('low', 'medium') THEN 'High'
        WHEN lower(COALESCE(t.priority, '')) = 'high' THEN 'Critical'
        ELSE COALESCE(t.priority, 'High')
      END
    FROM candidates c
    WHERE t.id = c.id
    RETURNING t.id
  )
  SELECT count(*) INTO n FROM upd;

  INSERT INTO public.ticket_activity (ticket_id, actor_id, action, detail, meta)
  SELECT t.id, auth.uid(), 'escalation',
         'Idle escalation (no agent activity ≥ ' || p_idle_hours || 'h)',
         jsonb_build_object('idle_hours', p_idle_hours, 'level', t.escalation_level)
  FROM public.tickets t
  WHERE t.escalated_at >= now() - interval '1 minute'
    AND COALESCE(t.escalation_level, 0) > 0;

  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.escalate_idle_tickets(int) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_idle_tickets(p_idle_hours int DEFAULT 24)
RETURNS TABLE (
  id uuid,
  ticket_number text,
  status text,
  priority text,
  idle_hours numeric,
  escalation_level int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    COALESCE(t.ticket_number, t.number::text, t.id::text) AS ticket_number,
    t.status,
    t.priority,
    round(EXTRACT(EPOCH FROM (now() - COALESCE(t.last_agent_activity_at, t.created_at))) / 3600.0, 1) AS idle_hours,
    COALESCE(t.escalation_level, 0) AS escalation_level
  FROM public.tickets t
  WHERE public.my_role() IN ('agent', 'admin')
    AND lower(COALESCE(t.status, '')) NOT IN ('resolved', 'closed', 'solved', 'done', 'complete', 'completed')
    AND COALESCE(t.last_agent_activity_at, t.created_at) < (now() - make_interval(hours => GREATEST(p_idle_hours, 1)));
$$;

GRANT EXECUTE ON FUNCTION public.list_idle_tickets(int) TO authenticated;

SELECT 'private-notes-audit-sla.sql applied' AS ok;
