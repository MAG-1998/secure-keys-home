-- Create visit penalties table
CREATE TABLE public.visit_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('cancellation', 'no_show')),
  penalty_level INTEGER NOT NULL CHECK (penalty_level BETWEEN 1 AND 3),
  visit_id UUID NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  moderator_id UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.visit_penalties ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own penalties"
ON public.visit_penalties
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can manage penalties"
ON public.visit_penalties
FOR ALL
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Function to calculate penalty level for a user
CREATE OR REPLACE FUNCTION public.calculate_penalty_level(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  penalty_count INTEGER;
  last_penalty_date TIMESTAMP WITH TIME ZONE;
  months_since_last INTEGER;
  adjusted_level INTEGER;
BEGIN
  -- Count active penalties in the last 2 years
  SELECT COUNT(*), MAX(applied_at) INTO penalty_count, last_penalty_date
  FROM public.visit_penalties
  WHERE user_id = user_id_param
    AND applied_at > now() - INTERVAL '2 years';
  
  -- If no penalties, start at level 1
  IF penalty_count = 0 THEN
    RETURN 1;
  END IF;
  
  -- Calculate months since last penalty
  IF last_penalty_date IS NOT NULL THEN
    months_since_last := EXTRACT(EPOCH FROM (now() - last_penalty_date)) / (30 * 24 * 3600);
  ELSE
    months_since_last := 0;
  END IF;
  
  -- Calculate adjusted level (decrease by 1 every 2 months)
  adjusted_level := GREATEST(1, penalty_count + 1 - (months_since_last / 2)::INTEGER);
  
  -- Cap at level 3
  RETURN LEAST(3, adjusted_level);
END;
$$;

-- Function to handle visit cancellation penalties
CREATE OR REPLACE FUNCTION public.handle_visit_cancellation(visit_id_param UUID, user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  penalty_level INTEGER;
  expires_at_date TIMESTAMP WITH TIME ZONE := NULL;
  penalty_message TEXT;
BEGIN
  -- Get the penalty level for this user
  penalty_level := public.calculate_penalty_level(user_id_param);
  
  -- Set expiration based on penalty level
  IF penalty_level = 2 THEN
    expires_at_date := now() + INTERVAL '1 week';
    penalty_message := 'You have been restricted from creating visit requests and halal financing requests for 1 week due to cancellation.';
  ELSIF penalty_level = 3 THEN
    expires_at_date := now() + INTERVAL '1 month';
    penalty_message := 'You have been restricted from creating visit requests and halal financing requests for 1 month due to multiple cancellations.';
  ELSE
    penalty_message := 'This is a warning. Further cancellations may result in restrictions.';
  END IF;
  
  -- Insert penalty record
  INSERT INTO public.visit_penalties (
    user_id, penalty_type, penalty_level, visit_id, expires_at
  ) VALUES (
    user_id_param, 'cancellation', penalty_level, visit_id_param, expires_at_date
  );
  
  -- Return penalty info
  RETURN jsonb_build_object(
    'penalty_level', penalty_level,
    'expires_at', expires_at_date,
    'message', penalty_message
  );
END;
$$;

-- Function to handle no-show penalties
CREATE OR REPLACE FUNCTION public.handle_no_show_penalty(visit_id_param UUID, user_id_param UUID, moderator_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  penalty_level INTEGER;
  expires_at_date TIMESTAMP WITH TIME ZONE := NULL;
  penalty_message TEXT;
BEGIN
  -- Get the penalty level for this user
  penalty_level := public.calculate_penalty_level(user_id_param);
  
  -- Set expiration based on penalty level
  IF penalty_level = 2 THEN
    expires_at_date := now() + INTERVAL '1 week';
    penalty_message := 'User has been restricted from creating visit requests and halal financing requests for 1 week due to no-show.';
  ELSIF penalty_level = 3 THEN
    expires_at_date := now() + INTERVAL '1 month';
    penalty_message := 'User has been restricted from creating visit requests and halal financing requests for 1 month due to multiple no-shows.';
  ELSE
    penalty_message := 'This is a warning for no-show. Further infractions may result in restrictions.';
  END IF;
  
  -- Insert penalty record
  INSERT INTO public.visit_penalties (
    user_id, penalty_type, penalty_level, visit_id, expires_at, moderator_id, notes
  ) VALUES (
    user_id_param, 'no_show', penalty_level, visit_id_param, expires_at_date, moderator_id_param, 'Applied by moderator for no-show'
  );
  
  -- Notify moderators if level 3 (potential ban consideration)
  IF penalty_level = 3 THEN
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    SELECT 
      p.user_id,
      'penalty:level_3',
      'User reached penalty level 3',
      'User has reached maximum penalty level and may need account review',
      'user',
      user_id_param,
      jsonb_build_object('penalty_level', penalty_level, 'visit_id', visit_id_param)
    FROM public.profiles p
    WHERE p.role IN ('moderator'::public.app_role, 'admin'::public.app_role);
  END IF;
  
  -- Return penalty info
  RETURN jsonb_build_object(
    'penalty_level', penalty_level,
    'expires_at', expires_at_date,
    'message', penalty_message
  );
END;
$$;

-- Update the can_user_create_visit_request function to check for penalties
CREATE OR REPLACE FUNCTION public.can_user_create_visit_request(user_id_param uuid)
RETURNS TABLE(can_create boolean, reason text, free_visits_used integer, is_restricted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  active_visits_this_week INTEGER;
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
$$;

-- Function to check if user can request halal financing (affected by penalties)
CREATE OR REPLACE FUNCTION public.can_user_request_halal_financing(user_id_param uuid)
RETURNS TABLE(can_request boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  active_penalty RECORD;
BEGIN
  -- Check for active penalties that restrict halal financing
  SELECT * INTO active_penalty
  FROM public.visit_penalties vp
  WHERE vp.user_id = user_id_param
    AND vp.is_active = true
    AND (vp.expires_at IS NULL OR vp.expires_at > now())
    AND vp.penalty_level >= 2;
  
  IF FOUND THEN
    RETURN QUERY SELECT false, 
      CASE 
        WHEN active_penalty.penalty_level = 2 THEN 'You are temporarily restricted from halal financing requests due to visit cancellations or no-shows (1 week)'
        WHEN active_penalty.penalty_level = 3 THEN 'You are temporarily restricted from halal financing requests due to multiple visit infractions (1 month)'
        ELSE 'You are temporarily restricted from halal financing requests'
      END;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Can request halal financing';
END;
$$;