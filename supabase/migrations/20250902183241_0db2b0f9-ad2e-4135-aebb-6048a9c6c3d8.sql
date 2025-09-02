-- Update the can_user_create_visit_request function to only count active visits
CREATE OR REPLACE FUNCTION public.can_user_create_visit_request(user_id_param uuid)
 RETURNS TABLE(can_create boolean, reason text, free_visits_used integer, is_restricted boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  active_visits_this_week INTEGER;
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
  
  -- Count only active visits in the current week (not finished visits)
  -- Active visits are: pending status OR confirmed status with future visit_date
  SELECT COUNT(*) INTO active_visits_this_week
  FROM public.property_visits pv
  WHERE pv.visitor_id = user_id_param
    AND pv.created_at >= date_trunc('week', now())
    AND pv.created_at < date_trunc('week', now()) + interval '1 week'
    AND (
      pv.status = 'pending' 
      OR (pv.status = 'confirmed' AND pv.visit_date > now())
    );
  
  -- Return result based on active visits only
  IF active_visits_this_week = 0 THEN
    RETURN QUERY SELECT true, 'Can create free visit request', active_visits_this_week, false;
  ELSIF active_visits_this_week < 5 THEN -- Allow up to 5 paid visits per week
    RETURN QUERY SELECT true, 'Must pay for additional visit request', active_visits_this_week, false;
  ELSE
    RETURN QUERY SELECT false, 'Weekly visit limit reached (5 visits maximum)', active_visits_this_week, false;
  END IF;
END;
$function$;