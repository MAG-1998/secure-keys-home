-- Check if users already exist and assign roles accordingly
-- For admin1@magit.com
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'admin1@magit.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = profiles.user_id AND role = 'admin'::app_role
);

-- For moderator1@magit.com  
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'moderator'::app_role
FROM public.profiles 
WHERE email = 'moderator1@magit.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = profiles.user_id AND role = 'moderator'::app_role
);

-- Alternative: Create test accounts with different emails if the above don't exist
-- Create admin test account
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin@test.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
    VALUES (
      gen_random_uuid(),
      'admin@test.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin Test"}',
      false,
      'authenticated'
    );
  END IF;
END $$;

-- Create moderator test account
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'moderator@test.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
    VALUES (
      gen_random_uuid(),
      'moderator@test.com',
      crypt('moderator123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Moderator Test"}',
      false,
      'authenticated'
    );
  END IF;
END $$;