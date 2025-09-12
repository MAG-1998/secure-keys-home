-- Fix RLS policy for halal_financing_document_requests to allow users to update their own document submissions
DROP POLICY IF EXISTS "Users can update their own document requests" ON halal_financing_document_requests;

CREATE POLICY "Users can update their own document requests" 
ON halal_financing_document_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM halal_financing_requests hfr 
    WHERE hfr.id = halal_financing_document_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
  )
);

-- Also allow moderators and admins to update any document requests
CREATE POLICY "Moderators and admins can update any document requests" 
ON halal_financing_document_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('moderator', 'admin')
  )
);