-- Add missing updated_at trigger for halal_finance_doc_requests table
CREATE TRIGGER update_halal_finance_doc_requests_updated_at
  BEFORE UPDATE ON public.halal_finance_doc_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create the missing trigger that calls the automation function when documents are submitted
CREATE OR REPLACE FUNCTION public.trigger_financing_stage_update_on_doc_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    PERFORM public.auto_update_financing_stage(NEW.halal_financing_request_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Add the trigger to halal_finance_doc_requests table
CREATE TRIGGER trigger_financing_stage_update_on_doc_change
  AFTER UPDATE ON public.halal_finance_doc_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_financing_stage_update_on_doc_change();

-- Update the auto_update_financing_stage function to add better logging
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
  
  -- Log that the function was called
  INSERT INTO halal_financing_activity_log (
    halal_financing_request_id,
    actor_id,
    action_type,
    details
  ) VALUES (
    financing_request_id_param,
    request_user_id,
    'automation_check',
    jsonb_build_object(
      'current_stage', current_stage,
      'trigger_reason', 'Document status updated to submitted'
    )
  );
  
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
  
  -- Log the document counts
  INSERT INTO halal_financing_activity_log (
    halal_financing_request_id,
    actor_id,
    action_type,
    details
  ) VALUES (
    financing_request_id_param,
    request_user_id,
    'document_count_check',
    jsonb_build_object(
      'total_docs', total_docs_count,
      'pending_docs', pending_docs_count,
      'can_progress', (pending_docs_count = 0 AND total_docs_count > 0)
    )
  );
  
  -- If no pending documents and at least one document exists, move to under_review
  IF pending_docs_count = 0 AND total_docs_count > 0 THEN
    -- Update the financing request stage
    UPDATE halal_financing_requests
    SET 
      stage = 'under_review',
      updated_at = now()
    WHERE id = financing_request_id_param;
    
    -- Log the activity
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
    
    -- Notify responsible person if assigned
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