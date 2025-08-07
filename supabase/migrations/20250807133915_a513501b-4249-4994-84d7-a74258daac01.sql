-- Emergency fix: Ensure all existing users have profiles
-- Insert profiles for any auth.users that don't have them
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'user'::app_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile for all new users (including test accounts)
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'::app_role
      WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::app_role
      ELSE 'user'::app_role
    END
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate entries
  
  RETURN NEW;
END;
$$;