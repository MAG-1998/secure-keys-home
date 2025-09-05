-- Clean up inconsistent halal financing data

-- 1. Fix properties where halal_status = 'disabled' but is_halal_available = true
UPDATE public.properties 
SET is_halal_available = false
WHERE halal_status = 'disabled' AND is_halal_available = true;

-- 2. Fix properties where halal_status = 'denied' but is_halal_available = true  
UPDATE public.properties 
SET is_halal_available = false
WHERE halal_status = 'denied' AND is_halal_available = true;

-- 3. Create a validation trigger to prevent invalid combinations
CREATE OR REPLACE FUNCTION validate_halal_financing_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- If halal_status is 'disabled' or 'denied', is_halal_available must be false
  IF NEW.halal_status IN ('disabled', 'denied') AND NEW.is_halal_available = true THEN
    RAISE EXCEPTION 'Cannot enable halal financing when status is disabled or denied';
  END IF;
  
  -- If halal_status is 'none' and user tries to enable, should change to pending_approval
  IF OLD.halal_status = 'none' AND NEW.is_halal_available = true AND NEW.halal_status = 'none' THEN
    NEW.halal_status := 'pending_approval';
    NEW.is_halal_available := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_validate_halal_financing ON public.properties;
CREATE TRIGGER trigger_validate_halal_financing
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION validate_halal_financing_consistency();