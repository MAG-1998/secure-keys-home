-- Fix storage RLS policies to allow authenticated users to upload files

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('properties', 'properties', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Delete existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload files to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in properties bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files from their folder" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated uploads to user folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all files in properties bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'properties');

-- Allow users to update files in their own folder
CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete files from their own folder
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);