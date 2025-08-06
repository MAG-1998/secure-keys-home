-- Enhanced RLS policy for user_roles to prevent self-elevation
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles except their own" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_id != auth.uid()
);

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role = 'admin'::app_role 
    AND user_id = '29058f10-301e-4a82-863d-c8a1f8ae6d64'::uuid
  )
);

-- Function to safely assign roles with audit logging
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role TEXT,
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_role_text TEXT;
  assigning_user_id UUID;
  new_role_enum app_role;
BEGIN
  -- Get the current user
  assigning_user_id := auth.uid();
  
  -- Convert text to enum
  new_role_enum := new_role::app_role;
  
  -- Check if the assigning user is admin
  IF NOT has_role(assigning_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign roles';
  END IF;
  
  -- Prevent self-role elevation (except for super admin)
  IF target_user_id = assigning_user_id AND 
     assigning_user_id != '29058f10-301e-4a82-863d-c8a1f8ae6d64'::uuid THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  -- Get current role if exists
  SELECT role::TEXT INTO current_role_text 
  FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  -- If different role exists, update it
  IF current_role_text IS NOT NULL AND current_role_text != new_role THEN
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id;
  END IF;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role_enum)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the action
  INSERT INTO public.role_audit_log 
  (user_id, target_user_id, old_role, new_role, action, changed_by, ip_address, user_agent)
  VALUES 
  (assigning_user_id, target_user_id, current_role_text, new_role, 
   CASE WHEN current_role_text IS NULL THEN 'assigned' ELSE 'changed' END,
   assigning_user_id, ip_addr, user_agent_str);
  
  RETURN TRUE;
END;
$$;

-- Function to log payment requests with rate limiting
CREATE OR REPLACE FUNCTION public.log_payment_request(
  user_id_param UUID,
  amount_param NUMERIC,
  currency_param TEXT,
  method_param TEXT,
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  recent_requests INTEGER;
BEGIN
  -- Check for rate limiting (max 5 requests per minute)
  SELECT COUNT(*) INTO recent_requests
  FROM public.payment_audit_log
  WHERE user_id = user_id_param
    AND created_at > (now() - INTERVAL '1 minute')
    AND status = 'requested';
  
  IF recent_requests >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before making another payment request.';
  END IF;
  
  -- Validate amount (minimum 1000 UZS, maximum 1,000,000,000 UZS)
  IF amount_param < 1000 OR amount_param > 1000000000 THEN
    RAISE EXCEPTION 'Invalid payment amount. Must be between 1,000 and 1,000,000,000 UZS';
  END IF;
  
  -- Log the payment request
  INSERT INTO public.payment_audit_log 
  (user_id, amount, currency, payment_method, status, ip_address, user_agent)
  VALUES 
  (user_id_param, amount_param, currency_param, method_param, 'requested', ip_addr, user_agent_str);
  
  RETURN TRUE;
END;
$$;