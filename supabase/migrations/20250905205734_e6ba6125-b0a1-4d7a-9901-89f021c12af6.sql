-- Fix photo URLs to match actual storage structure
UPDATE properties 
SET 
  photos = (
    SELECT jsonb_agg(
      regexp_replace(
        photo_url::text, 
        '"/storage/v1/object/public/properties/', 
        '"', 
        'g'
      )::jsonb
    )
    FROM jsonb_array_elements(photos) AS photo_url
  ),
  image_url = CASE 
    WHEN image_url LIKE '/storage/v1/object/public/properties/%' THEN
      regexp_replace(image_url, '^/storage/v1/object/public/properties/', '')
    ELSE image_url
  END
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0;