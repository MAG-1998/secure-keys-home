-- Add activity log entry for the stage change
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

-- Send notification to responsible person
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

-- Restore a simplified permission trigger for future security
CREATE OR REPLACE FUNCTION public.enforce_halal_request_update_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Admins can update anything
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  ELSIF public.has_role(auth.uid(), 'moderator'::public.app_role) THEN
    -- Moderators can only modify moderator_notes
    IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.stage IS DISTINCT FROM OLD.stage THEN
      RAISE EXCEPTION 'Moderators can only update moderator_notes';
    END IF;
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Only moderators and admins can update halal financing requests';
  END IF;
END;
$function$;

-- Add the trigger back
CREATE TRIGGER enforce_halal_request_update_permissions
  BEFORE UPDATE ON public.halal_financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_halal_request_update_permissions();