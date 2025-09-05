-- Restore from backup and apply correct fix
UPDATE properties 
SET 
  photos = b.original_photos,
  image_url = b.original_image_url
FROM photo_url_backups b
WHERE properties.id = b.property_id 
AND b.backup_id = (SELECT backup_id FROM photo_url_backups ORDER BY created_at DESC LIMIT 1);