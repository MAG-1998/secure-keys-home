-- Drop all triggers that depend on the function
DROP TRIGGER IF EXISTS enforce_halal_request_update_permissions ON halal_financing_requests;
DROP TRIGGER IF EXISTS trg_enforce_halal_request_update_permissions ON halal_financing_requests;
DROP TRIGGER IF EXISTS trg_enforce_halal_update_permissions ON halal_financing_requests;

-- Now drop the function
DROP FUNCTION IF EXISTS public.enforce_halal_request_update_permissions() CASCADE;

-- Update the financing request stage
UPDATE halal_financing_requests
SET 
  stage = 'under_review',
  updated_at = now()
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';

-- Verify the update worked
SELECT id, stage, updated_at 
FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';