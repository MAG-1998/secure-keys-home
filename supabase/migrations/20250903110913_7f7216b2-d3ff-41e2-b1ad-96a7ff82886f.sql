-- Add DELETE policy for moderators and admins to delete halal financing requests
CREATE POLICY "Moderators and admins can delete halal financing requests" 
ON halal_financing_requests 
FOR DELETE 
TO public 
USING (
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);