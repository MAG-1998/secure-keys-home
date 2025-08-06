-- Assign admin role to the user with email abubakrp707@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('29058f10-301e-4a82-863d-c8a1f8ae6d64', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;