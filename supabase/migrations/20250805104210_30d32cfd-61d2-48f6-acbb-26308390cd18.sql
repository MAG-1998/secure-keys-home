-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create property applications table
CREATE TABLE public.property_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_type TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC,
  description TEXT,
  visit_hours JSONB DEFAULT '[]'::jsonb,
  virtual_tour BOOLEAN DEFAULT false,
  photos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderator_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_applications
CREATE POLICY "Users can view their own applications" 
ON public.property_applications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications" 
ON public.property_applications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Moderators can view all applications" 
ON public.property_applications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update applications" 
ON public.property_applications 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Add status column to properties table to track review status
ALTER TABLE public.properties ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'suspended'));

-- Update property policies to include status filter
DROP POLICY "Users can view all properties" ON public.properties;
CREATE POLICY "Users can view active properties" 
ON public.properties 
FOR SELECT 
USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating timestamps
CREATE TRIGGER update_property_applications_updated_at
BEFORE UPDATE ON public.property_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();