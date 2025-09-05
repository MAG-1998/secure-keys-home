-- Clean fix for photo URLs to match storage structure
UPDATE properties 
SET 
  photos = (
    SELECT jsonb_agg(
      regexp_replace(
        regexp_replace(photo_url::text, '"([^/]+)/([^/]+)/', '"\1/properties/\2/', 'g'),
        '""$', '"', 'g'
      )::jsonb
    )
    FROM jsonb_array_elements(photos) AS photo_url
  ),
  image_url = regexp_replace(image_url, '^([^/]+)/([^/]+)/', '\1/properties/\2/', 'g')
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0;