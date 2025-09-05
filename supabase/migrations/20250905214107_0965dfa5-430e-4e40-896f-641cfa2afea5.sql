-- Add land_area_sotka field to properties table for houses
ALTER TABLE public.properties 
ADD COLUMN land_area_sotka numeric;

-- Create halal_financing_listing_requests table for property owners requesting halal financing availability
CREATE TABLE public.halal_financing_listing_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id uuid NOT NULL,
    user_id uuid NOT NULL,
    requested_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending',
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    admin_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on halal_financing_listing_requests
ALTER TABLE public.halal_financing_listing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for halal_financing_listing_requests
CREATE POLICY "Property owners can create halal listing requests" 
ON public.halal_financing_listing_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Property owners can view their own halal listing requests" 
ON public.halal_financing_listing_requests 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators and admins can update halal listing requests" 
ON public.halal_financing_listing_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_halal_financing_listing_requests_updated_at
BEFORE UPDATE ON public.halal_financing_listing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();