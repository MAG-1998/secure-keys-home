-- Create new RPC function to get visitor profiles for property owners
CREATE OR REPLACE FUNCTION public.get_visitor_profile_for_property_owner(visitor_user_id uuid, property_id_param uuid)
 RETURNS TABLE(user_id uuid, display_name text, user_type text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    p.user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) as display_name,
    p.user_type,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = visitor_user_id
    AND (
      -- Property owner can see visitor profiles for their properties
      EXISTS (
        SELECT 1 FROM public.properties prop 
        WHERE prop.id = property_id_param 
        AND prop.user_id = auth.uid()
      )
      -- Or user can see their own profile
      OR auth.uid() = p.user_id
      -- Or admins can see all profiles  
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    );
$function$