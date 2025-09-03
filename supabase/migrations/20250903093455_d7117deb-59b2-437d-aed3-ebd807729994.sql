-- Fix the automation function to work around RLS policies
-- The issue is that the function runs with user permissions, but RLS blocks the updates

-- Update the auto_update_financing_stage function to be SECURITY DEFINER with elevated privileges
CREATE OR REPLACE FUNCTION public.auto_update_financing_stage(financing_request_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_stage financing_workflow_stage;
  pending_docs_count INTEGER;
  total_docs_count INTEGER;
  request_user_id uuid;
  request_responsible_person_id uuid;
BEGIN
  -- Get current stage and related info with explicit table aliases
  SELECT hfr.stage, hfr.user_id, hfr.responsible_person_id
  INTO current_stage, request_user_id, request_responsible_person_id
  FROM halal_financing_requests hfr
  WHERE hfr.id = financing_request_id_param;
  
  -- Only proceed if current stage is document_collection
  IF current_stage != 'document_collection' THEN
    RETURN FALSE;
  END IF;
  
  -- Count total and pending document requests
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status != 'submitted' THEN 1 END) as pending
  INTO total_docs_count, pending_docs_count
  FROM halal_finance_doc_requests
  WHERE halal_financing_request_id = financing_request_id_param;
  
  -- If no pending documents and at least one document exists, move to under_review
  IF pending_docs_count = 0 AND total_docs_count > 0 THEN
    -- Update the financing request stage (bypass RLS with SECURITY DEFINER)
    UPDATE halal_financing_requests
    SET 
      stage = 'under_review',
      updated_at = now()
    WHERE id = financing_request_id_param;
    
    -- Log the activity (bypass RLS with SECURITY DEFINER)
    INSERT INTO halal_financing_activity_log (
      halal_financing_request_id,
      actor_id,
      action_type,
      details
    ) VALUES (
      financing_request_id_param,
      request_user_id,
      'stage_change',
      jsonb_build_object(
        'from_stage', 'document_collection',
        'to_stage', 'under_review',
        'reason', 'All required documents submitted',
        'automatic', true
      )
    );
    
    -- Notify responsible person if assigned (bypass RLS with SECURITY DEFINER)
    IF request_responsible_person_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id, data)
      VALUES (
        request_responsible_person_id,
        'financing:documents_complete',
        'All Documents Submitted',
        'All required documents have been submitted and the request is now under review',
        'halal_financing_request',
        financing_request_id_param,
        jsonb_build_object('stage', 'under_review')
      );
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Now manually fix the current financing request
SELECT public.auto_update_financing_stage('2b7738ca-a424-4aa3-8bac-2f7a4d0b7f95');