-- Enable RLS on the halal_financing_listing_requests table (fixing security linter error)
ALTER TABLE public.halal_financing_listing_requests ENABLE ROW LEVEL SECURITY;