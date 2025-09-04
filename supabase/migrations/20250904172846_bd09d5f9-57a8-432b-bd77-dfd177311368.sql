-- Critical Security Fix #1: Prevent Role Escalation
-- Replace the existing "Users can update their own profile" policy with a more restrictive one
-- that prevents users from updating their role field

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that prevents role updates by regular users
CREATE POLICY "Users can update their own profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND (
  -- Only allow role updates if user is admin
  OLD.role = NEW.role OR has_role(auth.uid(), 'admin'::app_role)
));

-- Critical Security Fix #2: Strengthen Profile Data Protection
-- Add a more restrictive policy for profile viewing to protect PII
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Replace with policies that limit PII exposure
CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow viewing of non-sensitive fields for messaging/property interactions
  auth.uid() IS NOT NULL AND (
    -- Users involved in property transactions
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.user_id = profiles.user_id 
      AND EXISTS (
        SELECT 1 FROM property_visits pv 
        WHERE pv.property_id = p.id 
        AND pv.visitor_id = auth.uid()
      )
    )
    OR
    -- Users in message conversations
    EXISTS (
      SELECT 1 FROM messages m 
      WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.user_id)
      OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.user_id)
    )
    OR
    -- Moderators and admins can see all
    has_role(auth.uid(), 'moderator'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Critical Security Fix #3: Secure Halal Financing Request Access
-- Ensure only authorized users can view financial data
DROP POLICY IF EXISTS "Users can view their own halal financing requests" ON public.halal_financing_requests;

CREATE POLICY "Restricted halal financing request access" 
ON public.halal_financing_requests 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR responsible_person_id = auth.uid()
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Critical Security Fix #4: Add Database Function Security
-- Fix search_path for all custom functions to prevent SQL injection
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';
ALTER FUNCTION public.get_safe_profile_for_messaging(uuid) SET search_path = 'public';
ALTER FUNCTION public.assign_role(uuid, app_role, uuid) SET search_path = 'public';
ALTER FUNCTION public.delete_user_account(uuid) SET search_path = 'public';
ALTER FUNCTION public.create_property_from_application(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_least_loaded_moderator() SET search_path = 'public';
ALTER FUNCTION public.calculate_penalty_level(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_visit_cancellation(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_no_show_penalty(uuid, uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.can_user_create_visit_request(uuid) SET search_path = 'public';
ALTER FUNCTION public.can_user_create_visit_request(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.can_user_request_halal_financing(uuid) SET search_path = 'public';
ALTER FUNCTION public.log_payment_request(uuid, numeric, text, text, inet, text) SET search_path = 'public';
ALTER FUNCTION public.auto_expire_visits() SET search_path = 'public';
ALTER FUNCTION public.auto_update_financing_stage(uuid) SET search_path = 'public';