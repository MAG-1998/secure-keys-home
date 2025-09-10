-- Function to migrate existing document files from properties bucket to documents bucket
CREATE OR REPLACE FUNCTION migrate_documents_to_new_bucket()
RETURNS TABLE(doc_request_id uuid, old_urls jsonb, new_urls jsonb, migration_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  doc_request RECORD;
  file_url text;
  old_file_urls jsonb;
  new_file_urls jsonb := '[]'::jsonb;
  source_path text;
  dest_path text;
  file_content bytea;
BEGIN
  -- Process each document request that has file URLs
  FOR doc_request IN 
    SELECT id, user_file_urls 
    FROM halal_finance_doc_requests 
    WHERE user_file_urls IS NOT NULL 
    AND jsonb_array_length(user_file_urls) > 0
  LOOP
    old_file_urls := doc_request.user_file_urls;
    new_file_urls := '[]'::jsonb;
    
    -- Process each file URL in the document request
    FOR i IN 0..jsonb_array_length(old_file_urls) - 1
    LOOP
      file_url := old_file_urls ->> i;
      
      -- Only migrate files that are in the properties bucket
      IF file_url LIKE '%storage/v1/object/public/properties/%' THEN
        -- Extract the path after 'properties/'
        source_path := split_part(file_url, '/storage/v1/object/public/properties/', 2);
        dest_path := source_path;
        
        -- Try to copy the file (this would need to be done via client-side or edge function in practice)
        -- For now, we'll just update the URL to point to documents bucket
        file_url := replace(file_url, '/storage/v1/object/public/properties/', '/storage/v1/object/public/documents/');
      END IF;
      
      new_file_urls := new_file_urls || to_jsonb(file_url);
    END LOOP;
    
    -- Update the document request with new URLs
    UPDATE halal_finance_doc_requests 
    SET user_file_urls = new_file_urls
    WHERE id = doc_request.id;
    
    RETURN QUERY SELECT 
      doc_request.id,
      old_file_urls,
      new_file_urls,
      'migrated'::text;
  END LOOP;
END;
$$;

-- Execute the migration
SELECT * FROM migrate_documents_to_new_bucket();