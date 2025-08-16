-- Add review fields to property_visits table
ALTER TABLE public.property_visits 
ADD COLUMN visitor_showed_up boolean DEFAULT NULL,
ADD COLUMN owner_review text DEFAULT NULL,
ADD COLUMN review_submitted_at timestamp with time zone DEFAULT NULL;