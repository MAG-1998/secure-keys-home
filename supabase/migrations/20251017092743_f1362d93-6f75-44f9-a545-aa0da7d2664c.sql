-- Ensure the company-documents bucket exists and is public
insert into storage.buckets (id, name, public)
values ('company-documents', 'company-documents', true)
on conflict (id) do update set public = true;

-- Storage RLS policies for company-documents
-- Allow public read access (for displaying logos/licenses)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for company-documents'
  ) THEN
    CREATE POLICY "Public read for company-documents"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'company-documents');
  END IF;

  -- Allow users to upload to their own folder (/{auth.uid()}/*)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to own folder in company-documents'
  ) THEN
    CREATE POLICY "Users can upload to own folder in company-documents"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'company-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Allow users to update files in their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own files in company-documents'
  ) THEN
    CREATE POLICY "Users can update own files in company-documents"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'company-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'company-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Allow users to delete files in their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own files in company-documents'
  ) THEN
    CREATE POLICY "Users can delete own files in company-documents"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'company-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;