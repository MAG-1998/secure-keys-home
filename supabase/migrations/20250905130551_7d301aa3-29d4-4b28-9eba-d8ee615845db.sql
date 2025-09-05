-- Update the trigger function to allow moderators to update stages when they are the responsible person
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
    -- Moderators can update stages only if they are the responsible person
    IF NEW.stage IS DISTINCT FROM OLD.stage AND NEW.responsible_person_id != auth.uid() THEN
      RAISE EXCEPTION 'Moderators can only update stages for requests assigned to them';
    END IF;
    -- Moderators can update other fields if they are the responsible person
    IF NEW.responsible_person_id != auth.uid() AND (
       NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.sent_back_to_responsible IS DISTINCT FROM OLD.sent_back_to_responsible
       OR NEW.sent_back_notes IS DISTINCT FROM OLD.sent_back_notes
    ) THEN
      RAISE EXCEPTION 'Moderators can only update moderator_notes for requests not assigned to them';
    END IF;
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Only moderators and admins can update halal financing requests';
  END IF;
END;
$function$;