-- Create RPC function to create property from approved application (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_property_from_application(
  application_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  app_record RECORD;
  new_property_id UUID;
BEGIN
  -- Get the application details
  SELECT * INTO app_record
  FROM public.property_applications
  WHERE id = application_id AND status = 'approved';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or not approved';
  END IF;
  
  -- Create the property
  INSERT INTO public.properties (
    user_id,
    title,
    location,
    price,
    bedrooms,
    bathrooms,
    area,
    description,
    visit_hours,
    status
  ) VALUES (
    app_record.user_id,
    CONCAT(INITCAP(app_record.property_type), ' in ', app_record.address),
    app_record.address,
    app_record.price,
    app_record.bedrooms,
    app_record.bathrooms,
    app_record.area,
    app_record.description,
    app_record.visit_hours,
    'active'
  ) RETURNING id INTO new_property_id;
  
  RETURN new_property_id;
END;
$$;