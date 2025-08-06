-- Create admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  gen_random_uuid(),
  'admin1@magit.com',
  crypt('admin1', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  false,
  'authenticated'
);

-- Create moderator user  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  gen_random_uuid(),
  'moderator1@magit.com', 
  crypt('moderator1', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Moderator User"}',
  false,
  'authenticated'
);

-- Create profiles for admin and moderator
INSERT INTO public.profiles (user_id, email, full_name, user_type)
SELECT id, email, raw_user_meta_data->>'full_name', 'buyer'
FROM auth.users 
WHERE email IN ('admin1@magit.com', 'moderator1@magit.com');

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin1@magit.com';

-- Assign moderator role  
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'moderator'::app_role
FROM auth.users 
WHERE email = 'moderator1@magit.com';