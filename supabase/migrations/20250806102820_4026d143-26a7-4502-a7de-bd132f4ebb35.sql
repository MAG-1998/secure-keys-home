-- Fix the infinite recursion issue by dropping the problematic policy
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create a simpler policy that allows users to manage roles if they already have admin role
-- We'll use the has_role function which should work correctly now
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Directly assign admin role to your user since the current role is NULL
INSERT INTO public.user_roles (user_id, role) 
VALUES ('29058f10-301e-4a82-863d-c8a1f8ae6d64', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;