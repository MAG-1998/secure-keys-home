-- Make documents bucket public (ignoring if policies already exist)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';