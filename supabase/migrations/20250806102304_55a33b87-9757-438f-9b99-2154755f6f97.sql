-- Fix RLS policies for user_roles table
-- First, drop the existing admin policy that might be causing issues
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a more permissive policy for admins to manage roles
-- This avoids potential circular dependency with has_role function
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::public.app_role
  )
);

-- Also ensure users can still view their own roles
-- (this policy should already exist but let's recreate it to be sure)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());