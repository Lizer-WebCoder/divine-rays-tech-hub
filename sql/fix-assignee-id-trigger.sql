-- Divine Rays — FIX: record "t" has no field "assignee_id"
-- Cause: trg_notify_staff_customer_comment used t.assignee_id
-- Your tickets table only has assigned_to
-- Paste this in Supabase → SQL Editor → Run

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
  target := t.assigned_to;  -- NOT assignee_id

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

-- Ensure trigger is attached
DROP TRIGGER IF EXISTS trg_notify_staff_customer_comment ON public.comments;
CREATE TRIGGER trg_notify_staff_customer_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_staff_customer_comment();
