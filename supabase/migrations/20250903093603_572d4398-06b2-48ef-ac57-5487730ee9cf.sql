-- Create a simple system function that can update financing requests directly
CREATE OR REPLACE FUNCTION public.system_update_financing_stage(
  financing_request_id_param uuid,
  new_stage financing_workflow_stage
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- This function runs with elevated privileges and bypasses RLS
  UPDATE halal_financing_requests
  SET 
    stage = new_stage,
    updated_at = now()
  WHERE id = financing_request_id_param;
  
  RETURN FOUND;
END;
$function$;

-- Manually update the current financing request directly
SELECT public.system_update_financing_stage(
  '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95',
  'under_review'::financing_workflow_stage
);

-- Add activity log entry manually
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
    'reason', 'Manual fix - all documents were submitted',
    'automatic', false,
    'fixed_automation_issue', true
  )
FROM halal_financing_requests 
WHERE id = '2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95';