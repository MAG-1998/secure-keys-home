-- Add new fields for halal financing approval workflow
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_halal_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS halal_status TEXT DEFAULT 'disabled' CHECK (halal_status IN ('disabled', 'pending_approval', 'approved')),
ADD COLUMN IF NOT EXISTS halal_approved_once BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS halal_approved_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS halal_approved_by UUID NULL;

-- Create financing request table
CREATE TABLE IF NOT EXISTS public.financing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'denied', 'needs_docs')),
  requested_amount NUMERIC,
  cash_available NUMERIC,
  period_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by UUID NULL,
  admin_notes TEXT,
  UNIQUE(property_id, user_id)
);

-- Create document requests table
CREATE TABLE IF NOT EXISTS public.finance_doc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financing_request_id UUID NOT NULL REFERENCES public.financing_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  description TEXT,
  deadline_at TIMESTAMPTZ NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'resolved')),
  file_url TEXT,
  response_notes TEXT,
  requested_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create financing activity log
CREATE TABLE IF NOT EXISTS public.financing_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financing_request_id UUID NOT NULL REFERENCES public.financing_requests(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.financing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_doc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for financing_requests
CREATE POLICY "Users can view their own financing requests"
ON public.financing_requests FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own financing requests"
ON public.financing_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can update financing requests"
ON public.financing_requests FOR UPDATE
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for finance_doc_requests
CREATE POLICY "Users can view doc requests for their financing requests"
ON public.finance_doc_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.financing_requests fr 
    WHERE fr.id = financing_request_id 
    AND (fr.user_id = auth.uid() OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Moderators and admins can manage doc requests"
ON public.finance_doc_requests FOR ALL
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can respond to doc requests"
ON public.finance_doc_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.financing_requests fr 
    WHERE fr.id = financing_request_id AND fr.user_id = auth.uid()
  )
);

-- RLS policies for financing_activity_log
CREATE POLICY "Users can view activity for their financing requests"
ON public.financing_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.financing_requests fr 
    WHERE fr.id = financing_request_id 
    AND (fr.user_id = auth.uid() OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "System can insert activity logs"
ON public.financing_activity_log FOR INSERT
WITH CHECK (true);

-- Update triggers for timestamps
CREATE TRIGGER update_financing_requests_updated_at
BEFORE UPDATE ON public.financing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_doc_requests_updated_at
BEFORE UPDATE ON public.finance_doc_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-expire old visit requests
CREATE OR REPLACE FUNCTION public.auto_expire_visits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Update expired visits
  UPDATE public.property_visits
  SET status = 'expired', updated_at = now()
  WHERE status IN ('pending', 'new') 
    AND visit_date < now()
    AND status != 'expired';
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Notify moderators and property owners for each expired visit
  INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
  SELECT 
    p.user_id,
    'visit:expired',
    'Visit request expired',
    'A visit request for your property has expired',
    'visit',
    pv.id,
    jsonb_build_object('property_id', pv.property_id, 'visitor_id', pv.visitor_id)
  FROM public.property_visits pv
  JOIN public.properties p ON p.id = pv.property_id
  WHERE pv.status = 'expired' 
    AND pv.updated_at > now() - interval '1 hour';
  
  -- Notify moderators
  INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
  SELECT 
    pr.user_id,
    'visit:expired_bulk',
    'Visit requests expired',
    expired_count || ' visit requests have expired',
    'system',
    null,
    jsonb_build_object('expired_count', expired_count)
  FROM public.profiles pr
  WHERE pr.role IN ('moderator'::public.app_role, 'admin'::public.app_role)
    AND expired_count > 0;
  
  RETURN expired_count;
END;
$$;