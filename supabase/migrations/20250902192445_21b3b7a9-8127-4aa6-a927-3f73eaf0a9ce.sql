-- Update property_visits status constraint to include 'cancelled' and 'finished'
ALTER TABLE public.property_visits 
DROP CONSTRAINT IF EXISTS property_visits_status_check;

ALTER TABLE public.property_visits 
ADD CONSTRAINT property_visits_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'denied'::text, 'cancelled'::text, 'finished'::text]));