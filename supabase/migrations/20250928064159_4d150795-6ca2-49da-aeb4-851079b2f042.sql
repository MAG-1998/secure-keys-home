-- Fix enforce_halal_request_update_permissions function to allow timestamp-only updates by request owner

CREATE OR REPLACE FUNCTION public.enforce_halal_request_update_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow admins full access
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  
  -- Allow moderators limited access (existing logic)
  IF public.has_role(auth.uid(), 'moderator'::app_role) THEN
    -- Moderators can update specific fields
    IF OLD.stage IS DISTINCT FROM NEW.stage OR
       OLD.responsible_person_id IS DISTINCT FROM NEW.responsible_person_id OR
       OLD.sent_back_to_responsible IS DISTINCT FROM NEW.sent_back_to_responsible OR
       OLD.sent_back_notes IS DISTINCT FROM NEW.sent_back_notes OR
       OLD.moderator_notes IS DISTINCT FROM NEW.moderator_notes OR
       OLD.updated_at IS DISTINCT FROM NEW.updated_at THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Allow request owner to update only updated_at timestamp (for activity logging)
  IF auth.uid() = NEW.user_id THEN
    -- Check if only updated_at is different
    IF OLD.stage IS NOT DISTINCT FROM NEW.stage AND
       OLD.responsible_person_id IS NOT DISTINCT FROM NEW.responsible_person_id AND
       OLD.sent_back_to_responsible IS NOT DISTINCT FROM NEW.sent_back_to_responsible AND
       OLD.sent_back_notes IS NOT DISTINCT FROM NEW.sent_back_notes AND
       OLD.moderator_notes IS NOT DISTINCT FROM NEW.moderator_notes AND
       OLD.admin_notes IS NOT DISTINCT FROM NEW.admin_notes AND
       OLD.admin_review_stage IS NOT DISTINCT FROM NEW.admin_review_stage AND
       OLD.status IS NOT DISTINCT FROM NEW.status AND
       OLD.request_notes IS NOT DISTINCT FROM NEW.request_notes AND
       OLD.attachments IS NOT DISTINCT FROM NEW.attachments AND
       OLD.requested_amount IS NOT DISTINCT FROM NEW.requested_amount AND
       OLD.cash_available IS NOT DISTINCT FROM NEW.cash_available AND
       OLD.period_months IS NOT DISTINCT FROM NEW.period_months AND
       OLD.reviewed_at IS NOT DISTINCT FROM NEW.reviewed_at AND
       OLD.reviewed_by IS NOT DISTINCT FROM NEW.reviewed_by AND
       OLD.updated_at IS DISTINCT FROM NEW.updated_at THEN
      RETURN NEW;
    END IF;
    
    -- Allow existing owner stage change (document_collection -> under_review)
    IF OLD.stage = 'document_collection'::financing_workflow_stage AND 
       NEW.stage = 'under_review'::financing_workflow_stage AND
       OLD.responsible_person_id IS NOT DISTINCT FROM NEW.responsible_person_id AND
       OLD.sent_back_to_responsible IS NOT DISTINCT FROM NEW.sent_back_to_responsible AND
       OLD.sent_back_notes IS NOT DISTINCT FROM NEW.sent_back_notes AND
       OLD.moderator_notes IS NOT DISTINCT FROM NEW.moderator_notes AND
       OLD.admin_notes IS NOT DISTINCT FROM NEW.admin_notes AND
       OLD.admin_review_stage IS NOT DISTINCT FROM NEW.admin_review_stage AND
       OLD.status IS NOT DISTINCT FROM NEW.status AND
       OLD.request_notes IS NOT DISTINCT FROM NEW.request_notes THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Reject all other updates
  RAISE EXCEPTION 'Only moderators and admins can update halal financing requests';
END;
$$;

-- Drop existing triggers and recreate
DROP TRIGGER IF EXISTS enforce_halal_request_update_permissions ON halal_financing_requests;
DROP TRIGGER IF EXISTS trg_enforce_halal_request_update_permissions ON halal_financing_requests;

-- Recreate the trigger
CREATE TRIGGER enforce_halal_request_update_permissions
BEFORE UPDATE ON halal_financing_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_halal_request_update_permissions();