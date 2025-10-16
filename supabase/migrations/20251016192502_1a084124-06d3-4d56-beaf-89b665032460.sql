-- Add new columns to profiles table for verification and company data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS registration_number TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_license_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_person_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS number_of_properties INTEGER DEFAULT NULL;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified);

-- Drop old CHECK constraint on user_type
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Rename user_type to account_type
ALTER TABLE public.profiles 
RENAME COLUMN user_type TO account_type;

-- Update existing values: 'buyer' and 'lister' both become 'individual'
UPDATE public.profiles 
SET account_type = 'individual' 
WHERE account_type IN ('buyer', 'lister');

-- Add new CHECK constraint with correct values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IN ('individual', 'legal_entity'));

-- Update default value
ALTER TABLE public.profiles 
ALTER COLUMN account_type SET DEFAULT 'individual';

-- Drop and recreate get_safe_profile_for_messaging function with new signature
DROP FUNCTION IF EXISTS public.get_safe_profile_for_messaging(uuid);

CREATE FUNCTION public.get_safe_profile_for_messaging(target_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, account_type text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    p.user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) as display_name,
    p.account_type,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND (
      auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1 FROM public.messages m 
        WHERE (
          (m.sender_id = auth.uid() AND m.recipient_id = p.user_id) 
          OR (m.recipient_id = auth.uid() AND m.sender_id = p.user_id)
        )
      )
    );
$$;

-- Drop and recreate get_visitor_profile_for_property_owner function with new signature
DROP FUNCTION IF EXISTS public.get_visitor_profile_for_property_owner(uuid, uuid);

CREATE FUNCTION public.get_visitor_profile_for_property_owner(visitor_user_id uuid, property_id_param uuid)
RETURNS TABLE(user_id uuid, display_name text, account_type text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    p.user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) as display_name,
    p.account_type,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = visitor_user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.properties prop 
        WHERE prop.id = property_id_param 
        AND prop.user_id = auth.uid()
      )
      OR auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    );
$$;

-- Update handle_new_user trigger to use account_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'::public.app_role
      WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::public.app_role
      ELSE 'user'::public.app_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Update setup_test_account trigger to use account_type
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.email IN ('admin@example.com', 'moderator@example.com') THEN
    INSERT INTO public.profiles (user_id, email, full_name, account_type, role)
    VALUES (
      NEW.id, 
      NEW.email, 
      CASE 
        WHEN NEW.email = 'admin@example.com' THEN 'Admin User'
        WHEN NEW.email = 'moderator@example.com' THEN 'Moderator User'
      END,
      'individual',
      CASE 
        WHEN NEW.email = 'admin@example.com' THEN 'admin'::public.app_role
        WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::public.app_role
      END
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for company documents bucket
CREATE POLICY "Users can upload their company documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Moderators and admins can view all company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-documents'
  AND (
    public.has_role(auth.uid(), 'moderator'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Users can update their own company documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own company documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);