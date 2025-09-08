-- Fix storage RLS policies for properties bucket
DO $$
BEGIN
    -- Ensure properties bucket exists
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('properties', 'properties', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Delete existing storage policies to avoid conflicts
DELETE FROM storage.policies WHERE bucket_id = 'properties';

-- Create comprehensive storage policies for properties bucket
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'properties' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all property images" ON storage.objects
FOR SELECT USING (bucket_id = 'properties');

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'properties' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'properties' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);