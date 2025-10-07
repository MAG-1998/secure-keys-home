-- Add show_phone column to properties table
ALTER TABLE public.properties 
ADD COLUMN show_phone BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.properties.show_phone IS 'Whether to display owner phone number on property listing';