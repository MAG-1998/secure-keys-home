-- Ensure RLS policy allows owners to update their doc requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'halal_finance_doc_requests' 
      AND policyname = 'Users can update their doc_requests'
  ) THEN
    CREATE POLICY "Users can update their doc_requests"
    ON public.halal_finance_doc_requests
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.halal_financing_requests fr
        WHERE fr.id = halal_finance_doc_requests.halal_financing_request_id
          AND fr.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.halal_financing_requests fr
        WHERE fr.id = halal_finance_doc_requests.halal_financing_request_id
          AND fr.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- Harden validate_financing_workflow to allow updated_at-only updates
CREATE OR REPLACE FUNCTION public.validate_financing_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
BEGIN
  -- If only updated_at changed, allow update
  IF (to_jsonb(NEW) - 'updated_at') = (to_jsonb(OLD) - 'updated_at') THEN
    RETURN NEW;
  END IF;

  -- Allow request owners to automatically progress from document_collection to under_review
  IF OLD.stage = 'document_collection' AND NEW.stage = 'under_review' AND NEW.user_id = auth.uid() THEN
      RETURN NEW;
  END IF;

  -- Only admin can assign responsible person from submitted stage
  IF OLD.stage = 'submitted' AND NEW.stage = 'assigned' THEN
      IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
          RAISE EXCEPTION 'Only admins can assign responsible persons';
      END IF;
      IF NEW.responsible_person_id IS NULL THEN
          RAISE EXCEPTION 'Responsible person must be assigned when moving to assigned stage';
      END IF;
  END IF;

  -- Only responsible person can move from assigned to document_collection
  IF OLD.stage = 'assigned' AND NEW.stage = 'document_collection' THEN
      IF NEW.responsible_person_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
          RAISE EXCEPTION 'Only responsible person or admin can move to document collection stage';
      END IF;
  END IF;

  -- Only responsible person can move from under_review to final_approval
  IF OLD.stage = 'under_review' AND NEW.stage = 'final_approval' THEN
      IF NEW.responsible_person_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
          RAISE EXCEPTION 'Only responsible person or admin can submit for final approval';
      END IF;
  END IF;

  -- Only admin can make final approval/denial
  IF OLD.stage = 'final_approval' AND NEW.stage IN ('approved', 'denied') THEN
      IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
          RAISE EXCEPTION 'Only admins can make final approval/denial decisions';
      END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

-- RPC to atomically submit document and trigger stage progression
CREATE OR REPLACE FUNCTION public.mark_doc_submitted(
  doc_req_id uuid,
  uploaded_urls jsonb,
  response_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  fr_id uuid;
BEGIN
  UPDATE public.halal_finance_doc_requests
  SET 
    user_file_urls = COALESCE(uploaded_urls, '[]'::jsonb),
    response_notes = response_notes,
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
  WHERE id = doc_req_id
  RETURNING halal_financing_request_id INTO fr_id;

  IF fr_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'err', 'Document request not found');
  END IF;

  -- Let automation check and advance if all docs submitted
  PERFORM public.auto_update_financing_stage(fr_id);

  RETURN jsonb_build_object('ok', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'err', SQLERRM);
END;
$fn$;