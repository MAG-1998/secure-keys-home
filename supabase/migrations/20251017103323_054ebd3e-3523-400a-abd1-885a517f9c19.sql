-- Drop the unmaintained number_of_properties column
ALTER TABLE profiles DROP COLUMN IF EXISTS number_of_properties;

-- Drop the restrictive policy that requires message history
DROP POLICY IF EXISTS "Limited profile access for interactions" ON profiles;

-- Create simple policy: any authenticated user can view profiles of sellers with active properties
CREATE POLICY "Authenticated users can view seller profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.user_id = profiles.user_id 
    AND p.status IN ('active', 'approved')
  )
);