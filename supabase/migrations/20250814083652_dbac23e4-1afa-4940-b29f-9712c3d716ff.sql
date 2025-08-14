-- Fix the security warning by setting proper search_path
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
SET search_path = ''
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
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      -- Users can see profiles of people they've messaged with
      OR EXISTS (
        SELECT 1 FROM public.messages m 
        WHERE (
          (m.sender_id = auth.uid() AND m.recipient_id = p.user_id) 
          OR (m.recipient_id = auth.uid() AND m.sender_id = p.user_id)
        )
      )
    );
$$;