-- 1) Enums for tickets
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_type') THEN
    CREATE TYPE public.ticket_type AS ENUM ('general','financing','complaint');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','escalated','closed');
  END IF;
END $$;

-- 2) Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assigned_to uuid NULL,
  type public.ticket_type NOT NULL DEFAULT 'general',
  priority public.ticket_priority NOT NULL DEFAULT 'low',
  status public.ticket_status NOT NULL DEFAULT 'open',
  subject text NULL,
  initial_message text NULL,
  property_id uuid NULL,
  auto_tags text[] NOT NULL DEFAULT '{}'::text[],
  escalation_level integer NOT NULL DEFAULT 0,
  sla_response_by timestamptz NULL,
  next_escalation_at timestamptz NULL,
  first_response_at timestamptz NULL,
  last_user_message_at timestamptz NULL,
  last_agent_message_at timestamptz NULL,
  closed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_next_escalation_at ON public.tickets(next_escalation_at);

-- 3) RLS for tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'moderator'::public.app_role) OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
CREATE POLICY "Users can create their own tickets"
ON public.tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Moderators and admins can create tickets for users" ON public.tickets;
CREATE POLICY "Moderators and admins can create tickets for users"
ON public.tickets
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'moderator'::public.app_role) OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Moderators and admins can update tickets" ON public.tickets;
CREATE POLICY "Moderators and admins can update tickets"
ON public.tickets
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'moderator'::public.app_role) OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'moderator'::public.app_role) OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 4) Updated_at trigger for tickets
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Add ticket_id to messages to link chat to tickets
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS ticket_id uuid;
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON public.messages(ticket_id);

-- 6) Function to pick least-loaded moderator
CREATE OR REPLACE FUNCTION public.get_least_loaded_moderator()
RETURNS uuid AS $$
DECLARE mod_id uuid;
BEGIN
  SELECT p.user_id
  INTO mod_id
  FROM public.profiles p
  WHERE p.role = 'moderator'::public.app_role
  ORDER BY (
    SELECT count(*) FROM public.tickets t 
    WHERE t.assigned_to = p.user_id AND t.status IN ('open','in_progress','escalated')
  ), p.user_id
  LIMIT 1;

  IF mod_id IS NULL THEN
    SELECT p.user_id INTO mod_id
    FROM public.profiles p
    WHERE p.role = 'admin'::public.app_role
    ORDER BY (
      SELECT count(*) FROM public.tickets t 
      WHERE t.assigned_to = p.user_id AND t.status IN ('open','in_progress','escalated')
    ), p.user_id
    LIMIT 1;
  END IF;

  RETURN mod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7) Auto-classify + assign BEFORE INSERT
CREATE OR REPLACE FUNCTION public.fn_ticket_auto_classify()
RETURNS trigger AS $$
DECLARE msg text := coalesce(NEW.initial_message, '');
BEGIN
  -- Type classification
  IF msg ~* '(finance|financing|loan|halal)' THEN
    NEW.type := 'financing'::public.ticket_type;
  ELSIF msg ~* '(report|complain|fraud|scam|abuse|ban)' THEN
    NEW.type := 'complaint'::public.ticket_type;
  ELSE
    NEW.type := coalesce(NEW.type, 'general'::public.ticket_type);
  END IF;

  -- Tags
  NEW.auto_tags := ARRAY[]::text[];
  IF msg ~* '(upload|file|document|pdf|jpg|jpeg|png)' THEN
    NEW.auto_tags := NEW.auto_tags || 'verification';
  END IF;
  IF msg ~* '(finance|financing|loan|halal)' THEN
    NEW.auto_tags := NEW.auto_tags || 'financing';
  END IF;
  IF msg ~* '(bug|error|issue|problem|crash)' THEN
    NEW.auto_tags := NEW.auto_tags || 'technical';
  END IF;
  IF msg ~* '(fraud|scam|spam|abuse|complain|report)' THEN
    NEW.auto_tags := NEW.auto_tags || 'complaint';
  END IF;

  -- Priority
  IF NEW.type = 'complaint'::public.ticket_type OR msg ~* '(fraud|payment|scam)' THEN
    NEW.priority := 'high'::public.ticket_priority;
  ELSIF NEW.type = 'financing'::public.ticket_type OR msg ~* '(verify|verification|loan|financ)' THEN
    NEW.priority := 'medium'::public.ticket_priority;
  ELSE
    NEW.priority := coalesce(NEW.priority, 'low'::public.ticket_priority);
  END IF;

  -- Assign moderator if not provided
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := public.get_least_loaded_moderator();
  END IF;

  -- SLA and escalation timers
  IF NEW.priority = 'high'::public.ticket_priority THEN
    NEW.sla_response_by := now() + interval '5 minutes';
    NEW.next_escalation_at := now() + interval '10 minutes';
  ELSIF NEW.priority = 'medium'::public.ticket_priority THEN
    NEW.sla_response_by := now() + interval '10 minutes';
    NEW.next_escalation_at := now() + interval '20 minutes';
  ELSE
    NEW.sla_response_by := now() + interval '20 minutes';
    NEW.next_escalation_at := now() + interval '40 minutes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS ticket_auto_classify ON public.tickets;
CREATE TRIGGER ticket_auto_classify
BEFORE INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.fn_ticket_auto_classify();

-- 8) Sync ticket activity on message insert
CREATE OR REPLACE FUNCTION public.fn_ticket_sync_on_message()
RETURNS trigger AS $$
DECLARE is_agent boolean;
BEGIN
  IF NEW.ticket_id IS NULL THEN
    RETURN NEW;
  END IF;

  is_agent := public.has_role(NEW.sender_id, 'moderator'::public.app_role) OR public.has_role(NEW.sender_id, 'admin'::public.app_role);

  IF is_agent THEN
    UPDATE public.tickets
    SET 
      last_agent_message_at = COALESCE(last_agent_message_at, now()),
      first_response_at = COALESCE(first_response_at, now()),
      status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
      next_escalation_at = now() + interval '1 hour',
      updated_at = now()
    WHERE id = NEW.ticket_id;
  ELSE
    UPDATE public.tickets
    SET 
      last_user_message_at = now(),
      updated_at = now()
    WHERE id = NEW.ticket_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS ticket_sync_on_message ON public.messages;
CREATE TRIGGER ticket_sync_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.fn_ticket_sync_on_message();

-- 9) Notifications for ticket lifecycle
CREATE OR REPLACE FUNCTION public.fn_notify_ticket_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    VALUES (
      NEW.assigned_to,
      'support:ticket_new',
      'New support ticket',
      left(coalesce(NEW.initial_message, ''), 140),
      'ticket',
      NEW.id,
      jsonb_build_object('priority', NEW.priority::text, 'type', NEW.type::text)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS notify_ticket_insert ON public.tickets;
CREATE TRIGGER notify_ticket_insert
AFTER INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_ticket_insert();

CREATE OR REPLACE FUNCTION public.fn_notify_ticket_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'escalated' THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
        VALUES (
          NEW.assigned_to,
          'support:ticket_escalated',
          'Ticket escalated to you',
          null,
          'ticket',
          NEW.id,
          jsonb_build_object('priority', NEW.priority::text)
        );
      END IF;
    ELSIF NEW.status = 'closed' THEN
      INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id)
      VALUES (
        NEW.user_id,
        'support:ticket_closed',
        'Your support ticket was closed',
        null,
        'ticket',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS notify_ticket_update ON public.tickets;
CREATE TRIGGER notify_ticket_update
AFTER UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_ticket_update();

-- 10) On-demand escalation function (to be called by a scheduled Edge Function)
CREATE OR REPLACE FUNCTION public.fn_escalate_tickets()
RETURNS integer AS $$
DECLARE admin_id uuid;
DECLARE updated_count integer := 0;
BEGIN
  -- Escalate to another moderator if SLA missed
  UPDATE public.tickets t
  SET 
    assigned_to = public.get_least_loaded_moderator(),
    escalation_level = t.escalation_level + 1,
    next_escalation_at = now() + interval '30 minutes',
    updated_at = now()
  WHERE t.status IN ('open','in_progress')
    AND t.next_escalation_at IS NOT NULL
    AND t.next_escalation_at <= now()
    AND t.escalation_level < 2;
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Pick admin with least load
  SELECT p.user_id INTO admin_id
  FROM public.profiles p
  WHERE p.role = 'admin'::public.app_role
  ORDER BY (
    SELECT count(*) FROM public.tickets tt 
    WHERE tt.assigned_to = p.user_id AND tt.status IN ('open','in_progress','escalated')
  ), p.user_id
  LIMIT 1;

  -- Escalate to admin after level 2 or > 2h no first response
  UPDATE public.tickets t
  SET 
    assigned_to = admin_id,
    status = 'escalated',
    escalation_level = 3,
    next_escalation_at = NULL,
    updated_at = now()
  WHERE t.status IN ('open','in_progress')
    AND (
      t.escalation_level >= 2 OR
      (t.first_response_at IS NULL AND t.created_at <= now() - interval '2 hours')
    );

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
