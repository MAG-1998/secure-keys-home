-- Ensure 'documents' bucket exists and is private by default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', false);
  END IF;
END $$;

-- Policy: Authenticated users (owners) and staff can READ documents in the 'documents' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Documents: users can read their files'
  ) THEN
    CREATE POLICY "Documents: users can read their files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'documents'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
    );
  END IF;
END $$;

-- Policy: Authenticated users can INSERT (upload) into their own folder (first segment of path = user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Documents: users can upload to their folder'
  ) THEN
    CREATE POLICY "Documents: users can upload to their folder"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'documents'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
    );
  END IF;
END $$;

-- Policy: Authenticated users can UPDATE their own files (and staff can manage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Documents: users can update their files'
  ) THEN
    CREATE POLICY "Documents: users can update their files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'documents'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
    )
    WITH CHECK (
      bucket_id = 'documents'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
    );
  END IF;
END $$;

-- Policy: Authenticated users can DELETE their own files (and staff can manage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Documents: users can delete their files'
  ) THEN
    CREATE POLICY "Documents: users can delete their files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'documents'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
    );
  END IF;
END $$;

-- Note: We keep the bucket private; owners and staff can access via these policies.
-- The frontend should upload to paths like `${user.id}/${financingRequestId}/${docRequestId}/filename.ext` for correct policy enforcement.
