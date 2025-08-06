-- Complete the profile setup for test accounts
INSERT INTO public.profiles (user_id, email, full_name, user_type)
SELECT id, email, raw_user_meta_data->>'full_name', 'buyer'
FROM auth.users 
WHERE email IN ('admin@test.com', 'moderator@test.com')
AND id NOT IN (SELECT user_id FROM public.profiles);

-- Assign admin role to admin test account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@test.com'
AND id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'::app_role
);

-- Assign moderator role to moderator test account  
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'moderator'::app_role
FROM auth.users 
WHERE email = 'moderator@test.com'
AND id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'moderator'::app_role
);