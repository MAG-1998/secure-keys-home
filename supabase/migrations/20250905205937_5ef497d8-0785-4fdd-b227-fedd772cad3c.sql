-- Revert and fix photo URLs to match actual storage structure
UPDATE properties 
SET 
  photos = (
    SELECT jsonb_agg(
      CASE 
        WHEN photo_url::text LIKE '%/properties/%' THEN photo_url
        ELSE 
          jsonb_build_object(
            'url',
            regexp_replace(
              regexp_replace(photo_url::text, '"([^/]+)/([^/]+)/', '"\1/properties/\2/', 'g'),
              '^"', '',
              'g'
            ) || '"'
          )->'url'
      END
    )
    FROM jsonb_array_elements(photos) AS photo_url
  ),
  image_url = CASE 
    WHEN image_url LIKE '%/properties/%' THEN image_url
    ELSE 
      regexp_replace(image_url, '^([^/]+)/([^/]+)/', '\1/properties/\2/', 'g')
  END
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0;