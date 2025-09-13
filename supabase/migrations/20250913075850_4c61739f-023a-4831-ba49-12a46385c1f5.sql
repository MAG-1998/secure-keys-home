-- Drop and recreate the function with different parameter name
DROP FUNCTION IF EXISTS public.mark_doc_submitted(uuid, jsonb, text);

CREATE OR REPLACE FUNCTION public.mark_doc_submitted(
  doc_req_id uuid,
  uploaded_urls jsonb,
  response_notes_param text DEFAULT NULL
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
    response_notes = response_notes_param,
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