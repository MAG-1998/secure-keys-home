-- Relax update permissions to allow request owners to advance stage when all docs are submitted
CREATE OR REPLACE FUNCTION public.enforce_halal_request_update_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow the request owner to perform a very specific update:
  -- stage transition from 'document_collection' to 'under_review', with no other field changes except updated_at
  IF auth.uid() = NEW.user_id THEN
    IF NEW.stage IS DISTINCT FROM OLD.stage
       AND OLD.stage = 'document_collection'
       AND NEW.stage = 'under_review'
       AND COALESCE(NEW.admin_notes, '') IS NOT DISTINCT FROM COALESCE(OLD.admin_notes, '')
       AND COALESCE(NEW.moderator_notes, '') IS NOT DISTINCT FROM COALESCE(OLD.moderator_notes, '')
       AND NEW.admin_review_stage IS NOT DISTINCT FROM OLD.admin_review_stage
       AND NEW.property_id IS NOT DISTINCT FROM OLD.property_id
       AND NEW.request_notes IS NOT DISTINCT FROM OLD.request_notes
       AND NEW.requested_amount IS NOT DISTINCT FROM OLD.requested_amount
       AND NEW.cash_available IS NOT DISTINCT FROM OLD.cash_available
       AND NEW.period_months IS NOT DISTINCT FROM OLD.period_months
       AND NEW.responsible_person_id IS NOT DISTINCT FROM OLD.responsible_person_id
       AND NEW.reviewed_by IS NOT DISTINCT FROM OLD.reviewed_by
       AND NEW.reviewed_at IS NOT DISTINCT FROM OLD.reviewed_at
       AND NEW.sent_back_notes IS NOT DISTINCT FROM OLD.sent_back_notes
       AND NEW.sent_back_to_responsible IS NOT DISTINCT FROM OLD.sent_back_to_responsible
       AND NEW.status IS NOT DISTINCT FROM OLD.status
    THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Admins can update anything
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  ELSIF public.has_role(auth.uid(), 'moderator'::public.app_role) THEN
    -- Moderators can only modify moderator_notes and attachments
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.property_id IS DISTINCT FROM OLD.property_id
       OR NEW.request_notes IS DISTINCT FROM OLD.request_notes THEN
      RAISE EXCEPTION 'Moderators can only update moderator_notes and attachments';
    END IF;
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Only moderators and admins can update halal financing requests';
  END IF;
END;
$$;