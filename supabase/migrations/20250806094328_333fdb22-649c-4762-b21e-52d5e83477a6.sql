-- Update the handle_new_user function to exclude test accounts to prevent conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile for non-test accounts (test accounts are handled by setup_test_account)
  IF NEW.email NOT IN ('admin1@test.com', 'moderator1@test.com') THEN
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