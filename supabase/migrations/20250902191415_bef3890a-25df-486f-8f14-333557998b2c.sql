-- Update the can_user_create_visit_request function to accept property_id parameter
-- and check for property-specific active requests

CREATE OR REPLACE FUNCTION public.can_user_create_visit_request(user_id_param uuid, property_id_param uuid DEFAULT NULL)
 RETURNS TABLE(can_create boolean, reason text, free_visits_used integer, is_restricted boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  active_visits_this_week INTEGER;
  property_active_requests INTEGER;
  active_restriction RECORD;
  active_penalty RECORD;
BEGIN
  -- Check for active visit restrictions (existing system)
  SELECT * INTO active_restriction
  FROM public.visit_restrictions vr
  WHERE vr.user_id = user_id_param 
    AND (vr.is_permanent = true OR vr.restricted_until > now());
  
  IF FOUND THEN
    RETURN QUERY SELECT false, 'User is restricted from creating visit requests', 0, true;
    RETURN;
  END IF;
  
  -- Check for active penalties
  SELECT * INTO active_penalty
  FROM public.visit_penalties vp
  WHERE vp.user_id = user_id_param
    AND vp.is_active = true
    AND (vp.expires_at IS NULL OR vp.expires_at > now())
    AND vp.penalty_level >= 2;
  
  IF FOUND THEN
    RETURN QUERY SELECT false, 
      CASE 
        WHEN active_penalty.penalty_level = 2 THEN 'You are temporarily restricted from creating visit requests due to previous cancellations or no-shows (1 week)'
        WHEN active_penalty.penalty_level = 3 THEN 'You are temporarily restricted from creating visit requests due to multiple cancellations or no-shows (1 month)'
        ELSE 'You are temporarily restricted from creating visit requests'
      END, 
      0, true;
    RETURN;
  END IF;
  
  -- Check for property-specific active requests if property_id is provided
  IF property_id_param IS NOT NULL THEN
    SELECT COUNT(*) INTO property_active_requests
    FROM public.property_visits pv
    WHERE pv.visitor_id = user_id_param
      AND pv.property_id = property_id_param
      AND (
        pv.status = 'pending' 
        OR (pv.status = 'confirmed' AND pv.visit_date > now())
      );
    
    IF property_active_requests > 0 THEN
      RETURN QUERY SELECT false, 'You already have an active visit request for this property', 0, false;
      RETURN;
    END IF;
  END IF;
  
  -- Count only active visits in the current week (not finished visits)
  SELECT COUNT(*) INTO active_visits_this_week
  FROM public.property_visits pv
  WHERE pv.visitor_id = user_id_param
    AND pv.created_at >= date_trunc('week', now())
    AND pv.created_at < date_trunc('week', now()) + INTERVAL '1 week'
    AND (
      pv.status = 'pending' 
      OR (pv.status = 'confirmed' AND pv.visit_date > now())
    );
  
  -- Return result based on active visits only
  IF active_visits_this_week = 0 THEN
    RETURN QUERY SELECT true, 'Can create free visit request', active_visits_this_week, false;
  ELSIF active_visits_this_week < 5 THEN
    RETURN QUERY SELECT true, 'Must pay for additional visit request', active_visits_this_week, false;
  ELSE
    RETURN QUERY SELECT false, 'Weekly visit limit reached (5 visits maximum)', active_visits_this_week, false;
  END IF;
END;
$function$