-- The financing request still shows document_collection despite all docs being submitted
-- Let's manually trigger the stage update since the automation should have worked

-- First, let's check the activity log to see if automation was attempted
SELECT 
  action_type,
  details,
  created_at
FROM halal_financing_activity_log 
WHERE halal_financing_request_id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95'
ORDER BY created_at DESC
LIMIT 10;

-- Now let's manually call the automation function to fix this
SELECT public.auto_update_financing_stage('2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95');