-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.can_user_create_visit_request(user_id_param UUID)
RETURNS TABLE(can_create BOOLEAN, reason TEXT, free_visits_used INTEGER, is_restricted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- Fix the notify_visitor_no_show function
CREATE OR REPLACE FUNCTION public.notify_visitor_no_show()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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