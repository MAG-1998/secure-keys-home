-- Fix security vulnerability: Restrict profile access for messaging
-- Drop the overly permissive policy first
DROP POLICY IF EXISTS "Users can view chat participants' profiles" ON public.profiles;

-- Create a new restrictive policy for profiles - only owner and admins can see full profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create a secure function that returns only safe profile data for messaging
CREATE OR REPLACE FUNCTION public.get_safe_profile_for_messaging(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  user_type text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) as display_name,
    p.user_type,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND (
      -- User can see their own profile
      auth.uid() = p.user_id
      -- Admins can see all profiles  
      OR has_role(auth.uid(), 'admin'::app_role)
      -- Users can see profiles of people they've messaged with
      OR EXISTS (
        SELECT 1 FROM messages m 
        WHERE (
          (m.sender_id = auth.uid() AND m.recipient_id = p.user_id) 
          OR (m.recipient_id = auth.uid() AND m.sender_id = p.user_id)
        )
      )
    );
$$;