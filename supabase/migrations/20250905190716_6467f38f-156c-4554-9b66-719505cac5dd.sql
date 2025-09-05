-- Call the migrate-photos-to-jpeg function with force mode for specific properties
SELECT functions.invoke('migrate-photos-to-jpeg', 
  JSON_BUILD_OBJECT(
    'propertyId', 'c0316ec3-fa2f-4a9c-a4d2-11e7b06d5b2e', 
    'forceConvert', true
  )::jsonb
);