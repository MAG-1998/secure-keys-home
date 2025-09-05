-- Enable RLS on photo_url_backups table (fixing security issue)
ALTER TABLE public.photo_url_backups ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for photo_url_backups
CREATE POLICY "Only admins can manage photo backups"
ON public.photo_url_backups
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));