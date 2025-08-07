-- Add missing fields from property_applications to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_type text,
ADD COLUMN IF NOT EXISTS virtual_tour boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS moderator_notes text,
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Update the status column to include application states
-- The status field will now handle: 'pending', 'approved', 'active', 'suspended', 'rejected'

-- Migrate existing property_applications data to properties table
INSERT INTO public.properties (
  user_id, 
  title, 
  location, 
  price, 
  bedrooms, 
  bathrooms, 
  area, 
  description, 
  visit_hours,
  property_type,
  virtual_tour,
  photos,
  documents,
  status,
  moderator_notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
)
SELECT 
  pa.user_id,
  CONCAT(INITCAP(pa.property_type), ' in ', pa.address) as title,
  pa.address as location,
  pa.price,
  pa.bedrooms,
  pa.bathrooms,
  pa.area,
  pa.description,
  pa.visit_hours,
  pa.property_type,
  pa.virtual_tour,
  pa.photos,
  pa.documents,
  pa.status,
  pa.moderator_notes,
  pa.reviewed_by,
  pa.reviewed_at,
  pa.created_at,
  pa.updated_at
FROM public.property_applications pa
WHERE NOT EXISTS (
  SELECT 1 FROM public.properties p 
  WHERE p.user_id = pa.user_id 
  AND p.location = pa.address 
  AND p.price = pa.price 
  AND p.created_at = pa.created_at
);

-- Update RLS policies for properties table to allow admin deletion
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;
CREATE POLICY "Admins can delete any property" 
ON public.properties 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies to allow moderators to view and update all properties
DROP POLICY IF EXISTS "Moderators can update any property" ON public.properties;
CREATE POLICY "Moderators can update any property" 
ON public.properties 
FOR UPDATE 
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update the existing view policy to be more explicit
DROP POLICY IF EXISTS "Users can view active properties" ON public.properties;
CREATE POLICY "Users can view properties" 
ON public.properties 
FOR SELECT 
USING (
  status IN ('active', 'approved') OR 
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update the create_property_from_application function to work with unified table
CREATE OR REPLACE FUNCTION public.create_property_from_application(application_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  app_record RECORD;
BEGIN
  -- Get the application details from properties table
  SELECT * INTO app_record
  FROM public.properties
  WHERE id = application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or not in pending status';
  END IF;
  
  -- Update the property status to active (approved)
  UPDATE public.properties
  SET 
    status = 'active',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = application_id;
  
  RETURN application_id;
END;
$function$;

-- Drop the property_applications table as it's no longer needed
DROP TABLE IF EXISTS public.property_applications;