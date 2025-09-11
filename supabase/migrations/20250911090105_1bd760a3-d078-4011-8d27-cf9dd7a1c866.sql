-- Make documents bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- Create RLS policies for documents bucket to maintain security
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow moderators and admins to access all documents
CREATE POLICY "Moderators and admins can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND (
    public.has_role(auth.uid(), 'moderator'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Moderators and admins can manage all documents" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' 
  AND (
    public.has_role(auth.uid(), 'moderator'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);