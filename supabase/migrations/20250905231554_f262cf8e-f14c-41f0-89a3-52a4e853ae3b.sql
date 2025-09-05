-- Convert all disabled halal status to null
UPDATE public.properties 
SET halal_status = NULL 
WHERE halal_status = 'disabled';