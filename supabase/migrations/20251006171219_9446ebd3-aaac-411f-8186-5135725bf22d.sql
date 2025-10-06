-- Fix the enforce_halal_request_update_permissions trigger to allow stage progression
DROP FUNCTION IF EXISTS public.enforce_halal_request_update_permissions() CASCADE;

CREATE OR REPLACE FUNCTION public.enforce_halal_request_update_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if only updated_at changed (system/trigger updates)
  IF (to_jsonb(NEW) - 'updated_at') = (to_jsonb(OLD) - 'updated_at') THEN
    RETURN NEW;
  END IF;

  -- Allow admins to update anything
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Allow moderators to update specific fields
  IF public.has_role(auth.uid(), 'moderator'::app_role) THEN
    IF (
      NEW.stage IS NOT DISTINCT FROM OLD.stage AND
      NEW.responsible_person_id IS NOT DISTINCT FROM OLD.responsible_person_id AND
      NEW.sent_back_to_responsible IS NOT DISTINCT FROM OLD.sent_back_to_responsible AND
      NEW.sent_back_notes IS NOT DISTINCT FROM OLD.sent_back_notes AND
      NEW.attachments IS NOT DISTINCT FROM OLD.attachments AND
      NEW.requested_amount IS NOT DISTINCT FROM OLD.requested_amount AND
      NEW.cash_available IS NOT DISTINCT FROM OLD.cash_available AND
      NEW.period_months IS NOT DISTINCT FROM OLD.period_months AND
      NEW.reviewed_at IS NOT DISTINCT FROM OLD.reviewed_at AND
      NEW.reviewed_by IS NOT DISTINCT FROM OLD.reviewed_by
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Allow request owner to automatically progress from document_collection to under_review
  IF OLD.stage = 'document_collection' AND NEW.stage = 'under_review' AND NEW.user_id = OLD.user_id THEN
    IF (
      NEW.status IS NOT DISTINCT FROM OLD.status AND
      NEW.request_notes IS NOT DISTINCT FROM OLD.request_notes AND
      NEW.admin_notes IS NOT DISTINCT FROM OLD.admin_notes AND
      NEW.moderator_notes IS NOT DISTINCT FROM OLD.moderator_notes AND
      NEW.admin_review_stage IS NOT DISTINCT FROM OLD.admin_review_stage AND
      NEW.sent_back_notes IS NOT DISTINCT FROM OLD.sent_back_notes AND
      NEW.responsible_person_id IS NOT DISTINCT FROM OLD.responsible_person_id AND
      NEW.sent_back_to_responsible IS NOT DISTINCT FROM OLD.sent_back_to_responsible AND
      NEW.reviewed_at IS NOT DISTINCT FROM OLD.reviewed_at AND
      NEW.reviewed_by IS NOT DISTINCT FROM OLD.reviewed_by AND
      NEW.attachments IS NOT DISTINCT FROM OLD.attachments AND
      NEW.requested_amount IS NOT DISTINCT FROM OLD.requested_amount AND
      NEW.cash_available IS NOT DISTINCT FROM OLD.cash_available AND
      NEW.period_months IS NOT DISTINCT FROM OLD.period_months
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Reject all other updates from non-staff
  RAISE EXCEPTION 'Only moderators and admins can update halal financing requests';
END;
$$;

-- Recreate the trigger
CREATE TRIGGER enforce_halal_request_update_permissions
  BEFORE UPDATE ON public.halal_financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_halal_request_update_permissions();