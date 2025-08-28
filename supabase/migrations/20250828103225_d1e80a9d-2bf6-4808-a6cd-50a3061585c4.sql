-- Add display_name column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing properties to use title as display_name
UPDATE public.properties 
SET display_name = title 
WHERE display_name IS NULL;

-- Make display_name not null after setting initial values
ALTER TABLE public.properties 
ALTER COLUMN display_name SET NOT NULL;

-- Remove Villa from property_type enum if it exists as an enum
-- First, check if we have any villa properties and convert them
UPDATE public.properties 
SET property_type = 'house' 
WHERE property_type = 'villa';

-- Add photo order support by creating a photos table for better organization
CREATE TABLE IF NOT EXISTS public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on property_photos
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_photos
CREATE POLICY "Property owners can manage their photos"
ON public.property_photos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_photos.property_id 
    AND p.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'moderator'::public.app_role) 
  OR has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Anyone can view property photos"
ON public.property_photos
FOR SELECT
USING (true);

-- Add trigger for updated_at on property_photos
CREATE TRIGGER update_property_photos_updated_at
  BEFORE UPDATE ON public.property_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add halal financing availability column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_halal_available BOOLEAN DEFAULT false;

-- Add cash_min_percent and period_options for halal financing
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS cash_min_percent INTEGER DEFAULT 50;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS period_options JSONB DEFAULT '["6", "9", "12", "18", "24"]'::jsonb;