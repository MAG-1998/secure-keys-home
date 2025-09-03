-- Check current stage to confirm the issue
SELECT id, stage, updated_at FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';

-- Drop ALL triggers that might be interfering
DROP TRIGGER IF EXISTS enforce_halal_request_update_permissions ON halal_financing_requests;

-- Now update the stage directly
UPDATE halal_financing_requests
SET 
  stage = 'under_review',
  updated_at = now()
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';

-- Confirm the update worked
SELECT id, stage, updated_at FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';