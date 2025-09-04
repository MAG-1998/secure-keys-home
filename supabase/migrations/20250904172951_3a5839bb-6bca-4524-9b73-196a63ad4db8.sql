-- Critical Security Fix #1: Prevent Role Escalation
-- Create a trigger-based approach to prevent role updates by regular users

-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that allows updates but we'll add a trigger for role validation
CREATE POLICY "Users can update their own profile fields" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to validate role changes
CREATE OR REPLACE FUNCTION public.validate_profile_role_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- If role is being changed and user is not admin, reject the update
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only administrators can modify user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent unauthorized role changes
DROP TRIGGER IF EXISTS prevent_unauthorized_role_changes ON public.profiles;
CREATE TRIGGER prevent_unauthorized_role_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_role_update();

-- Critical Security Fix #2: Strengthen Profile Data Protection
-- Replace existing policies with more restrictive ones
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Allow users to view their own full profile
CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow limited profile viewing for business interactions
CREATE POLICY "Limited profile access for interactions" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Moderators and admins can see all profiles
    has_role(auth.uid(), 'moderator'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
    -- Or users in active business relationships (messages, property visits)
    OR EXISTS (
      SELECT 1 FROM messages m 
      WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.user_id)
      OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.user_id)
    )
  )
);