-- Update the setup_test_account function to use @example.com test emails
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only process if this is one of our test accounts
  IF NEW.email IN ('admin@example.com', 'moderator@example.com') THEN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (NEW.id, NEW.email, 
            CASE 
              WHEN NEW.email = 'admin@example.com' THEN 'Admin User'
              WHEN NEW.email = 'moderator@example.com' THEN 'Moderator User'
            END, 
            'buyer');
    
    -- Assign role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 
            CASE 
              WHEN NEW.email = 'admin@example.com' THEN 'admin'::public.app_role
              WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::public.app_role
            END);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also update the handle_new_user function to exclude the new test emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile for non-test accounts (test accounts are handled by setup_test_account)
  IF NEW.email NOT IN ('admin@example.com', 'moderator@example.com') THEN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;