-- Add moderator-specific fields to halal financing requests
ALTER TABLE public.halal_financing_requests
  ADD COLUMN IF NOT EXISTS moderator_notes text,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Trigger function to enforce update permissions by role
CREATE OR REPLACE FUNCTION public.enforce_halal_request_update_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
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

-- Attach the permission enforcement trigger
DROP TRIGGER IF EXISTS trg_enforce_halal_request_update_permissions ON public.halal_financing_requests;
CREATE TRIGGER trg_enforce_halal_request_update_permissions
BEFORE UPDATE ON public.halal_financing_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_halal_request_update_permissions();

-- Ensure updated_at auto-updates on changes
DROP TRIGGER IF EXISTS trg_update_halal_requests_updated_at ON public.halal_financing_requests;
CREATE TRIGGER trg_update_halal_requests_updated_at
BEFORE UPDATE ON public.halal_financing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();