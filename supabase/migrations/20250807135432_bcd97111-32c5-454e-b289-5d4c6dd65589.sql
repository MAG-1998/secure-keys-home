-- Add halal financing fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS halal_financing_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS halal_financing_status text DEFAULT 'none' CHECK (halal_financing_status IN ('none', 'requested', 'approved', 'rejected'));

-- Create halal financing requests table
CREATE TABLE IF NOT EXISTS public.halal_financing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_notes text,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

-- Enable RLS on halal financing requests
ALTER TABLE public.halal_financing_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for halal_financing_requests
CREATE POLICY "Users can create their own halal financing requests"
ON public.halal_financing_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own halal financing requests"
ON public.halal_financing_requests
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators and admins can update halal financing requests"
ON public.halal_financing_requests
FOR UPDATE
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE TRIGGER update_halal_financing_requests_updated_at
  BEFORE UPDATE ON public.halal_financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();