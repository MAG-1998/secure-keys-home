-- First, create the app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');
    END IF;
END $$;

-- Recreate the setup_test_account function with proper enum reference
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only process if this is one of our test accounts
  IF NEW.email IN ('admin1@test.com', 'moderator1@test.com') THEN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (NEW.id, NEW.email, 
            CASE 
              WHEN NEW.email = 'admin1@test.com' THEN 'Admin User'
              WHEN NEW.email = 'moderator1@test.com' THEN 'Moderator User'
            END, 
            'buyer');
    
    -- Assign role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 
            CASE 
              WHEN NEW.email = 'admin1@test.com' THEN 'admin'::public.app_role
              WHEN NEW.email = 'moderator1@test.com' THEN 'moderator'::public.app_role
            END);
  END IF;
  
  RETURN NEW;
END;
$$;