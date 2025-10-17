-- Add show_phone column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- Migrate existing data: Set profile.show_phone to true if ANY of user's properties has show_phone = true
UPDATE profiles p
SET show_phone = true
WHERE EXISTS (
  SELECT 1 FROM properties prop 
  WHERE prop.user_id = p.user_id 
  AND prop.show_phone = true
);

-- Drop show_phone column from properties table
ALTER TABLE properties DROP COLUMN IF EXISTS show_phone;

-- Drop show_phone column from rejected_properties table if it exists
ALTER TABLE rejected_properties DROP COLUMN IF EXISTS show_phone;