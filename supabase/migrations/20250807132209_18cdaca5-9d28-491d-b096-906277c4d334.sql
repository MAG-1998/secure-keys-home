-- Performance optimization: Add critical database indexes for faster queries

-- Index for user-specific property queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

-- Index for property status filtering 
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Composite index for user properties by status (optimizes dashboard queries)
CREATE INDEX IF NOT EXISTS idx_properties_user_status ON public.properties(user_id, status);

-- Index for property views analytics
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);

-- Index for property visits analytics  
CREATE INDEX IF NOT EXISTS idx_property_visits_property_id ON public.property_visits(property_id);

-- Index for property location-based searches
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);

-- Index for created_at for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Index for property searches with price filtering
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);

-- Composite index for property searches (location + status)
CREATE INDEX IF NOT EXISTS idx_properties_location_status ON public.properties(location, status) WHERE status = 'approved';