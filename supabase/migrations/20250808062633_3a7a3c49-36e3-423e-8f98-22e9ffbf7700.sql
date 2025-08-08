-- Add admin policies for profiles table
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for properties table (if not already exists)
CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to delete user account (admin only)
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete user accounts';
  END IF;
  
  -- Delete from profiles table (cascades to other tables)
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  -- Log the deletion
  INSERT INTO public.role_audit_log (
    user_id, target_user_id, changed_by, old_role, new_role, action
  ) VALUES (
    target_user_id, target_user_id, auth.uid(), 
    (SELECT role::text FROM public.profiles WHERE user_id = target_user_id), 
    'deleted', 'account_deletion'
  );
  
  RETURN true;
END;
$$;