-- Update the workflow validation function to allow owners to progress from document_collection to under_review
CREATE OR REPLACE FUNCTION public.validate_financing_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

    -- Admin can send back to responsible person from final_approval
    IF OLD.stage = 'final_approval' AND NEW.stage = 'under_review' AND NEW.sent_back_to_responsible = true THEN
        IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only admins can send back requests to responsible person';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Ensure the RLS policy allows owners to update their document requests
DROP POLICY IF EXISTS "Users can respond to doc requests" ON halal_finance_doc_requests;
CREATE POLICY "Users can respond to doc requests" 
ON halal_finance_doc_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM halal_financing_requests hfr 
    WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM halal_financing_requests hfr 
    WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
  )
);