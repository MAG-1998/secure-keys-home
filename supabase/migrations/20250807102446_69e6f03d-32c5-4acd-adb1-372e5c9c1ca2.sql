-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role app_role NOT NULL DEFAULT 'user'::app_role;

-- Migrate existing role data from user_roles to profiles
UPDATE public.profiles 
SET role = ur.role::app_role
FROM public.user_roles ur 
WHERE profiles.user_id = ur.user_id;

-- Update the has_role function to check profiles.role instead of user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only create profile for non-test accounts (test accounts are handled by setup_test_account)
  IF NEW.email NOT IN ('admin@example.com', 'moderator@example.com') THEN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'user'::app_role
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update the setup_test_account function to set role in profiles
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only process if this is one of our test accounts
  IF NEW.email IN ('admin@example.com', 'moderator@example.com') THEN
    -- Create profile with role
    INSERT INTO public.profiles (user_id, email, full_name, user_type, role)
    VALUES (NEW.id, NEW.email, 
            CASE 
              WHEN NEW.email = 'admin@example.com' THEN 'Admin User'
              WHEN NEW.email = 'moderator@example.com' THEN 'Moderator User'
            END, 
            'buyer',
            CASE 
              WHEN NEW.email = 'admin@example.com' THEN 'admin'::app_role
              WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::app_role
            END);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update assignRole function to update profiles.role
CREATE OR REPLACE FUNCTION public.assign_role(
  target_user_id uuid,
  new_role app_role,
  changed_by_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_role app_role;
BEGIN
  -- Get current role
  SELECT role INTO old_role
  FROM public.profiles
  WHERE user_id = target_user_id;

  -- Update role in profiles
  UPDATE public.profiles
  SET role = new_role
  WHERE user_id = target_user_id;

  -- Log the role change
  INSERT INTO public.role_audit_log (
    user_id, target_user_id, changed_by, old_role, new_role, action
  ) VALUES (
    target_user_id, target_user_id, changed_by_user_id, old_role::text, new_role::text, 'role_change'
  );

  RETURN true;
END;
$function$;

-- Drop the user_roles table as it's no longer needed
DROP TABLE IF EXISTS public.user_roles;