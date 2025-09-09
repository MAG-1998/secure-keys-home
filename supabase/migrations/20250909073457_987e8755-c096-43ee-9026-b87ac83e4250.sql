-- Fix existing photo URLs that are not properly formatted
UPDATE property_photos 
SET url = CASE 
  WHEN url LIKE 'http%' THEN url 
  ELSE 'https://mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/' || url
END
WHERE url NOT LIKE 'http%';