-- Fix security vulnerability: Restrict profile access for messaging
-- Create a view that only exposes non-sensitive data for messaging participants

-- Create a secure view for chat participants that only shows necessary data
CREATE OR REPLACE VIEW public.chat_participant_profiles AS
SELECT 
  user_id,
  COALESCE(full_name, split_part(email, '@', 1)) as display_name,
  created_at,
  user_type
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.chat_participant_profiles SET (security_barrier = true);

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view chat participants' profiles" ON public.profiles;

-- Create a new restrictive policy for profiles - only owner and admins
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policies for the new view
CREATE POLICY "Users can view chat participants display info" 
ON public.chat_participant_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR EXISTS (
    SELECT 1 FROM messages m 
    WHERE (
      (m.sender_id = auth.uid() AND m.recipient_id = chat_participant_profiles.user_id) 
      OR (m.recipient_id = auth.uid() AND m.sender_id = chat_participant_profiles.user_id)
    )
  )
);