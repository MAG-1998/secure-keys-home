-- Create public bucket for property images
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

-- Policies for the bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view property images'
  ) THEN
    CREATE POLICY "Public can view property images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'properties');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload property images'
  ) THEN
    CREATE POLICY "Users can upload property images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own property images'
  ) THEN
    CREATE POLICY "Users can update own property images"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own property images'
  ) THEN
    CREATE POLICY "Users can delete own property images"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;