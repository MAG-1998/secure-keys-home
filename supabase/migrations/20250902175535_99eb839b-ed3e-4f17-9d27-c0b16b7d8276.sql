-- Add RLS policy to allow users to delete their own halal financing requests
-- Only when not assigned to moderator/admin and still in early stages
CREATE POLICY "Users can delete their own unassigned halal financing requests" 
ON public.halal_financing_requests 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND responsible_person_id IS NULL 
  AND (status = 'pending' OR stage = 'submitted')
);