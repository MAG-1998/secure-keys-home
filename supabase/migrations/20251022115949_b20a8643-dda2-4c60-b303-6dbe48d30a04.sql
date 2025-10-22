-- Add city column to properties table for efficient filtering
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS city text;

-- Create index for faster city filtering
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);

-- Backfill existing properties with city data from location field
UPDATE properties 
SET city = CASE
  WHEN location ILIKE '%Tashkent%' OR location ILIKE '%Ташкент%' OR location ILIKE '%Toshkent%' THEN 'Tashkent'
  WHEN location ILIKE '%Kokand%' OR location ILIKE '%Коканд%' OR location ILIKE '%Qo''qon%' OR location ILIKE '%Ферганская область%' THEN 'Kokand'
  ELSE 'Tashkent'
END
WHERE city IS NULL;