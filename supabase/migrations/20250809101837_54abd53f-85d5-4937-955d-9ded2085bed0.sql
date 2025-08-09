-- Create reports and red list tables with RLS and notifications

-- 1) User reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  message_id UUID NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  decision TEXT NULL,
  reviewed_by UUID NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policies for user_reports
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
CREATE POLICY "Users can create reports"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Reporter can view own reports" ON public.user_reports;
CREATE POLICY "Reporter can view own reports"
ON public.user_reports
FOR SELECT
USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators and admins can view all reports" ON public.user_reports;
CREATE POLICY "Moderators and admins can view all reports"
ON public.user_reports
FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Moderators and admins can update reports" ON public.user_reports;
CREATE POLICY "Moderators and admins can update reports"
ON public.user_reports
FOR UPDATE
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 2) Red list table for banned identifiers
CREATE TABLE IF NOT EXISTS public.red_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  reason TEXT,
  banned_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes to prevent duplicates (case-insensitive email)
CREATE UNIQUE INDEX IF NOT EXISTS red_list_email_key ON public.red_list (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS red_list_phone_key ON public.red_list (phone) WHERE phone IS NOT NULL;

ALTER TABLE public.red_list ENABLE ROW LEVEL SECURITY;

-- Only moderators and admins can manage red list entries
DROP POLICY IF EXISTS "Admins and moderators can manage red list" ON public.red_list;
CREATE POLICY "Admins and moderators can manage red list"
ON public.red_list
FOR ALL
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 3) Notify moderators/admins when a new report is created
CREATE OR REPLACE FUNCTION public.fn_notify_user_report_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
  SELECT p.user_id, 'report:new', 'New user report', left(NEW.reason, 140), 'report', NEW.id,
         jsonb_build_object('reported_user_id', NEW.reported_user_id, 'reporter_id', NEW.reporter_id)
  FROM public.profiles p
  WHERE p.role IN ('moderator'::public.app_role, 'admin'::public.app_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_user_report_insert ON public.user_reports;
CREATE TRIGGER trg_notify_user_report_insert
AFTER INSERT ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_user_report_insert();