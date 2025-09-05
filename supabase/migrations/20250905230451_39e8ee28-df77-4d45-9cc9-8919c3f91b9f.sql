-- Remove redundant halal financing fields
ALTER TABLE public.properties 
DROP COLUMN IF EXISTS halal_approved_once,
DROP COLUMN IF EXISTS halal_financing_requested,
DROP COLUMN IF EXISTS halal_financing_status,
DROP COLUMN IF EXISTS is_halal_financed;

-- Update halal_status to ensure only valid values
UPDATE public.properties 
SET halal_status = 'none' 
WHERE halal_status IS NULL OR halal_status = '';

-- Clean up any invalid halal_status values
UPDATE public.properties 
SET halal_status = 'none' 
WHERE halal_status NOT IN ('none', 'pending_approval', 'approved', 'denied', 'disabled');

-- Update properties where is_halal_available is true but status is 'none' to 'pending_approval'
UPDATE public.properties 
SET halal_status = 'pending_approval' 
WHERE is_halal_available = true AND halal_status = 'none';

-- Ensure consistency: if approved, make sure is_halal_available is true
UPDATE public.properties 
SET is_halal_available = true 
WHERE halal_status = 'approved' AND is_halal_available = false;