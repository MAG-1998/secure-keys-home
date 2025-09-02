-- Fix property photos access control - restrict to active/approved properties only
DROP POLICY IF EXISTS "Anyone can view property photos" ON public.property_photos;

CREATE POLICY "Users can view photos of active properties" 
ON public.property_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_photos.property_id 
    AND p.status IN ('active', 'approved')
  )
  OR EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_photos.property_id 
    AND p.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);