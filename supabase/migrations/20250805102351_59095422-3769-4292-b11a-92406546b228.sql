-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2),
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_halal_financed BOOLEAN DEFAULT false,
  visit_hours JSONB DEFAULT '[]'::jsonb, -- Array of available visit time slots
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create property visits table
CREATE TABLE public.property_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  visitor_id UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_custom_time BOOLEAN DEFAULT false,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2) DEFAULT 200000,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create property views table for analytics
CREATE TABLE public.property_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL
);

-- Create saved properties table
CREATE TABLE public.saved_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Users can view all properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Users can create their own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

-- Property visits policies
CREATE POLICY "Property owners can view visits to their properties" ON public.property_visits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid())
  OR visitor_id = auth.uid()
);
CREATE POLICY "Users can create visit requests" ON public.property_visits FOR INSERT WITH CHECK (auth.uid() = visitor_id);
CREATE POLICY "Property owners can update visits to their properties" ON public.property_visits FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid())
  OR visitor_id = auth.uid()
);

-- Property views policies
CREATE POLICY "Property owners can view analytics for their properties" ON public.property_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can create property views" ON public.property_views FOR INSERT WITH CHECK (true);

-- Saved properties policies
CREATE POLICY "Users can view their saved properties" ON public.saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save properties" ON public.saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved properties" ON public.saved_properties FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_property_visits_updated_at BEFORE UPDATE ON public.property_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();