-- Fix RLS policies for halal_finance_doc_requests table to allow document uploads

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Moderators and admins can manage doc requests" ON halal_finance_doc_requests;
DROP POLICY IF EXISTS "Users can respond to doc requests" ON halal_finance_doc_requests;
DROP POLICY IF EXISTS "Users can update their doc_requests" ON halal_finance_doc_requests;
DROP POLICY IF EXISTS "Users can view doc requests for their financing requests" ON halal_finance_doc_requests;

-- Create clean, non-conflicting policies

-- Allow users to view document requests for their own financing requests
CREATE POLICY "Users can view their doc requests" 
ON halal_finance_doc_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM halal_financing_requests hfr 
    WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to update document requests for their own financing requests
CREATE POLICY "Users can update their doc requests" 
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

-- Allow moderators and admins to manage all document requests
CREATE POLICY "Staff can manage all doc requests" 
ON halal_finance_doc_requests 
FOR ALL 
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow staff to create document requests
CREATE POLICY "Staff can create doc requests" 
ON halal_finance_doc_requests 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));