-- Fix RLS policy for halal_finance_doc_requests to allow document uploads
DROP POLICY IF EXISTS "Users can respond to doc requests" ON public.halal_finance_doc_requests;

CREATE POLICY "Users can respond to doc requests" 
ON public.halal_finance_doc_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 
  FROM halal_financing_requests hfr 
  WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 
  FROM halal_financing_requests hfr 
  WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
));