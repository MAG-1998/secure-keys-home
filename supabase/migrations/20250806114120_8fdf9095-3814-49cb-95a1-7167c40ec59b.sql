-- Enhanced RLS policy for user_roles to prevent self-elevation
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles except their own" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::public.app_role) 
  AND user_id != auth.uid()
);

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  auth.uid() = '29058f10-301e-4a82-863d-c8a1f8ae6d64'::uuid
);

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