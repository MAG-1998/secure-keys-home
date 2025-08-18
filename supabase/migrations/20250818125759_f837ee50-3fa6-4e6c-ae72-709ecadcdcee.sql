-- Create visit restrictions table for banned users
CREATE TABLE public.visit_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restricted_by UUID NOT NULL,
  reason TEXT,
  restricted_until TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_restrictions ENABLE ROW LEVEL SECURITY;

-- Policies for visit restrictions
CREATE POLICY "Moderators and admins can manage visit restrictions"
ON public.visit_restrictions
FOR ALL
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own restrictions"
ON public.visit_restrictions
FOR SELECT
USING (auth.uid() = user_id);

-- Add payment fields to property_visits
ALTER TABLE public.property_visits 
ADD COLUMN is_paid_visit BOOLEAN DEFAULT false,
ADD COLUMN payment_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'none';

-- Create function to check if user can create visit request
CREATE OR REPLACE FUNCTION public.can_user_create_visit_request(user_id_param UUID)
RETURNS TABLE(can_create BOOLEAN, reason TEXT, free_visits_used INTEGER, is_restricted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  visits_this_week INTEGER;
  active_restriction RECORD;
BEGIN
  -- Check for active restrictions
  SELECT * INTO active_restriction
  FROM public.visit_restrictions vr
  WHERE vr.user_id = user_id_param 
    AND (vr.is_permanent = true OR vr.restricted_until > now());
  
  IF FOUND THEN
    RETURN QUERY SELECT false, 'User is restricted from creating visit requests', 0, true;
    RETURN;
  END IF;
  
  -- Count visits in the current week
  SELECT COUNT(*) INTO visits_this_week
  FROM public.property_visits pv
  WHERE pv.visitor_id = user_id_param
    AND pv.created_at >= date_trunc('week', now())
    AND pv.created_at < date_trunc('week', now()) + interval '1 week';
  
  -- Return result
  IF visits_this_week = 0 THEN
    RETURN QUERY SELECT true, 'Can create free visit request', visits_this_week, false;
  ELSIF visits_this_week < 5 THEN -- Allow up to 5 paid visits per week
    RETURN QUERY SELECT true, 'Must pay for additional visit request', visits_this_week, false;
  ELSE
    RETURN QUERY SELECT false, 'Weekly visit limit reached (5 visits maximum)', visits_this_week, false;
  END IF;
END;
$$;

-- Create function to handle no-show notifications
CREATE OR REPLACE FUNCTION public.notify_visitor_no_show()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger when visitor_showed_up is set to false for the first time
  IF NEW.visitor_showed_up = false AND OLD.visitor_showed_up IS NULL THEN
    -- Notify all moderators and admins
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    SELECT 
      p.user_id,
      'visit:no_show',
      'Visitor did not show up',
      'A visitor failed to show up for a confirmed visit',
      'visit',
      NEW.id,
      jsonb_build_object(
        'property_id', NEW.property_id,
        'visitor_id', NEW.visitor_id,
        'visit_date', NEW.visit_date
      )
    FROM public.profiles p
    WHERE p.role IN ('moderator'::public.app_role, 'admin'::public.app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for no-show notifications
CREATE TRIGGER trigger_notify_visitor_no_show
  AFTER UPDATE ON public.property_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_visitor_no_show();

-- Update updated_at trigger for visit_restrictions
CREATE TRIGGER update_visit_restrictions_updated_at
  BEFORE UPDATE ON public.visit_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();