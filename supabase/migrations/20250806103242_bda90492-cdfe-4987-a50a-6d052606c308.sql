-- Create proper foreign key relationships that are missing

-- Add foreign key from user_roles to profiles (via user_id)
ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_profiles 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key from property_applications to profiles (via user_id) 
ALTER TABLE public.property_applications 
ADD CONSTRAINT fk_property_applications_profiles 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key from properties to profiles (via user_id)
ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_profiles 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key from profiles to auth.users (user_id should reference auth.users.id)
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_users 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;