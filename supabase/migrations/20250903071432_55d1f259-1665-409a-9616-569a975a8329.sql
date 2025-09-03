-- Manually update the financing request that should have been automatically updated
UPDATE halal_financing_requests
SET 
  stage = 'under_review',
  updated_at = now()
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95'
  AND stage = 'document_collection';

-- Log the manual correction activity
INSERT INTO halal_financing_activity_log (
  halal_financing_request_id,
  actor_id,
  action_type,
  details
) 
SELECT 
  '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95',
  user_id,
  'stage_change',
  jsonb_build_object(
    'from_stage', 'document_collection',
    'to_stage', 'under_review',
    'reason', 'Manual correction - all documents were submitted',
    'automatic', false,
    'corrected_bug', true
  )
FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';

-- Notify responsible person
INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id, data)
SELECT 
  responsible_person_id,
  'financing:documents_complete',
  'All Documents Submitted',
  'All required documents have been submitted and the request is now under review',
  'halal_financing_request',
  '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95',
  jsonb_build_object('stage', 'under_review')
FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95'
  AND responsible_person_id IS NOT NULL;