-- Fix storage RLS policies to allow moderators and admins to upload files

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads to user folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- Allow authenticated users to upload files to their own folder OR moderators/admins to upload anywhere
CREATE POLICY "Allow uploads to user folder or by moderators" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Users can upload to their own folder
    (storage.foldername(name))[1] = auth.uid()::text
    -- OR moderators/admins can upload anywhere
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  )
);

-- Allow users to update files in their own folder OR moderators/admins to update anywhere
CREATE POLICY "Allow users to update own files or moderators anywhere" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Users can update their own files
    (storage.foldername(name))[1] = auth.uid()::text
    -- OR moderators/admins can update anywhere
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  )
) WITH CHECK (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  )
);

-- Allow users to delete files from their own folder OR moderators/admins to delete anywhere
CREATE POLICY "Allow users to delete own files or moderators anywhere" ON storage.objects
FOR DELETE USING (
  bucket_id = 'properties' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Users can delete their own files
    (storage.foldername(name))[1] = auth.uid()::text
    -- OR moderators/admins can delete anywhere
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  )
);