-- Add district column to properties if it doesn't exist
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS district text;

-- Create an index to speed up district-based filtering
CREATE INDEX IF NOT EXISTS idx_properties_district ON public.properties (district);

-- Attach trigger to enforce moderator field-level permissions on halal_financing_requests
DROP TRIGGER IF EXISTS trg_enforce_halal_update_permissions ON public.halal_financing_requests;
CREATE TRIGGER trg_enforce_halal_update_permissions
BEFORE UPDATE ON public.halal_financing_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_halal_request_update_permissions();