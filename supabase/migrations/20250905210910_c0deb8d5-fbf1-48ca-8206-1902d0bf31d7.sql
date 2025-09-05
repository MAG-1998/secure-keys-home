-- Fix malformed photo URLs with extra quotes and inconsistent formats
UPDATE properties 
SET 
  photos = (
    SELECT jsonb_agg(
      CASE 
        WHEN value::text LIKE '%""' THEN
          to_jsonb(replace(replace(value #>> '{}', '""', ''), '"', ''))
        ELSE 
          to_jsonb(replace(value #>> '{}', '"', ''))
      END
    )
    FROM jsonb_array_elements(photos)
  ),
  image_url = CASE 
    WHEN image_url LIKE '%""' THEN
      replace(replace(image_url, '""', ''), '"', '')
    ELSE 
      replace(image_url, '"', '')
  END
WHERE photos IS NOT NULL OR image_url IS NOT NULL;