-- Fix RLS policy for property_photos to allow admins and moderators
-- Drop the existing ALL policy
DROP POLICY IF EXISTS "Property owners can manage their photos" ON property_photos;

-- Create separate policies for better control
CREATE POLICY "Property owners can manage their photos" ON property_photos
FOR ALL USING (
  (EXISTS (SELECT 1 FROM properties p WHERE p.id = property_photos.property_id AND p.user_id = auth.uid()))
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM properties p WHERE p.id = property_photos.property_id AND p.user_id = auth.uid()))
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);