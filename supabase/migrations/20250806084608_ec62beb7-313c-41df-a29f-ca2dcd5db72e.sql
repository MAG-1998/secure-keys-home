-- Clean up existing test accounts
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@test.com', 'moderator@test.com')
);

DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@test.com', 'moderator@test.com')
);

-- Note: We cannot directly delete from auth.users via SQL migration
-- The accounts will need to be created through the signup process or Supabase dashboard

-- Clean up any existing admin1/moderator1 accounts first
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin1@test.com', 'moderator1@test.com')
);

DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin1@test.com', 'moderator1@test.com')
);

-- Create a function to set up test account after signup
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
              WHEN NEW.email = 'admin1@test.com' THEN 'admin'::app_role
              WHEN NEW.email = 'moderator1@test.com' THEN 'moderator'::app_role
            END);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for test account setup
DROP TRIGGER IF EXISTS setup_test_accounts_trigger ON auth.users;
CREATE TRIGGER setup_test_accounts_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_test_account();