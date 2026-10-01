-- Divine Rays — notify agents/admins on new customer tickets + customer replies
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text DEFAULT 'info',
  title text,
  body text NOT NULL,
  ticket_number text,
  meta jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications (user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_staff" ON public.notifications;
CREATE POLICY "notifications_insert_staff" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.my_role() IN ('agent', 'admin')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_staff_users(
  p_type text,
  p_title text,
  p_body text,
  p_ticket_number text,
  p_meta jsonb,
  p_only_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff RECORD;
BEGIN
  IF p_only_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, ticket_number, meta, read)
    VALUES (p_only_user_id, p_type, p_title, p_body, p_ticket_number, COALESCE(p_meta, '{}'::jsonb), false);
    RETURN;
  END IF;

  FOR staff IN
    SELECT id FROM public.profiles
    WHERE lower(COALESCE(role, '')) IN ('agent', 'admin')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, ticket_number, meta, read)
    VALUES (staff.id, p_type, p_title, p_body, p_ticket_number, COALESCE(p_meta, '{}'::jsonb), false);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_staff_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cust_name text;
  num text;
  title text;
BEGIN
  SELECT COALESCE(full_name, username, split_part(COALESCE(email, ''), '@', 1), 'A customer')
    INTO cust_name
  FROM public.profiles
  WHERE id = NEW.requester_id;

  num := COALESCE(NEW.ticket_number, LEFT(NEW.id::text, 8));
  title := COALESCE(NULLIF(trim(NEW.title), ''), 'Support request');

  PERFORM public.notify_staff_users(
    'ticket_created',
    'New ticket ' || num,
    COALESCE(cust_name, 'A customer') || ' created ticket ' || num || ': ' || title,
    num,
    jsonb_build_object(
      'ticket_id', NEW.id,
      'ticket_number', num,
      'title', title,
      'requester_id', NEW.requester_id,
      'priority', NEW.priority
    ),
    NULL
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_staff_new_ticket ON public.tickets;
CREATE TRIGGER trg_notify_staff_new_ticket
  AFTER INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_staff_new_ticket();

CREATE OR REPLACE FUNCTION public.trg_notify_staff_customer_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t RECORD;
  author_role text;
  author_name text;
  num text;
  snippet text;
  target uuid;
BEGIN
  IF COALESCE(NEW.is_internal, false) = true THEN
    RETURN NEW;
  END IF;

  SELECT role, COALESCE(full_name, username, split_part(COALESCE(email, ''), '@', 1), 'Customer')
    INTO author_role, author_name
  FROM public.profiles
  WHERE id = NEW.author_id;

  IF lower(COALESCE(author_role, 'customer')) NOT IN ('customer', '') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO t FROM public.tickets WHERE id = NEW.ticket_id;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  num := COALESCE(t.ticket_number, LEFT(t.id::text, 8));
  snippet := left(COALESCE(NEW.body, ''), 120);
  target := COALESCE(t.assignee_id, t.assigned_to);

  IF target IS NOT NULL THEN
    PERFORM public.notify_staff_users(
      'ticket_reply',
      'Reply on ' || num,
      COALESCE(author_name, 'Customer') || ' replied on ticket ' || num || ': ' || snippet,
      num,
      jsonb_build_object(
        'ticket_id', t.id,
        'ticket_number', num,
        'comment_id', NEW.id,
        'author_id', NEW.author_id
      ),
      target
    );
  ELSE
    PERFORM public.notify_staff_users(
      'ticket_reply',
      'Reply on ' || num,
      COALESCE(author_name, 'Customer') || ' replied on unassigned ticket ' || num || ': ' || snippet,
      num,
      jsonb_build_object(
        'ticket_id', t.id,
        'ticket_number', num,
        'comment_id', NEW.id,
        'author_id', NEW.author_id
      ),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_staff_customer_comment ON public.comments;
CREATE TRIGGER trg_notify_staff_customer_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_staff_customer_comment();
