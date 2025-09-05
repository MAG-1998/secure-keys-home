-- Clean up photo URLs by removing duplicate /properties/ segments
UPDATE properties 
SET 
  photos = (
    SELECT jsonb_agg(
      CASE 
        WHEN value::text LIKE '%/properties/properties/%' THEN
          to_jsonb(replace(value #>> '{}', '/properties/properties/', '/properties/'))
        ELSE value
      END
    )
    FROM jsonb_array_elements(photos)
  ),
  image_url = CASE 
    WHEN image_url LIKE '%/properties/properties/%' THEN
      replace(image_url, '/properties/properties/', '/properties/')
    ELSE image_url
  END
WHERE photos IS NOT NULL OR image_url IS NOT NULL;