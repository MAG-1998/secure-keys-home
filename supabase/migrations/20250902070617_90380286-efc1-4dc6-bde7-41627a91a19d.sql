-- Drop the unused financing_requests table and related dependencies
DROP TABLE IF EXISTS public.financing_requests CASCADE;
DROP TABLE IF EXISTS public.financing_communications CASCADE;
DROP TABLE IF EXISTS public.financing_activity_log CASCADE;
DROP TABLE IF EXISTS public.finance_doc_requests CASCADE;

-- Add missing columns to halal_financing_requests to match the functionality
ALTER TABLE public.halal_financing_requests 
ADD COLUMN IF NOT EXISTS requested_amount numeric,
ADD COLUMN IF NOT EXISTS cash_available numeric,
ADD COLUMN IF NOT EXISTS period_months integer,
ADD COLUMN IF NOT EXISTS responsible_person_id uuid,
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'submitted';

-- Create updated communications table for halal financing
CREATE TABLE public.halal_financing_communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  halal_financing_request_id uuid NOT NULL REFERENCES public.halal_financing_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  file_urls jsonb DEFAULT '[]'::jsonb,
  is_internal boolean DEFAULT false,
  message_type text NOT NULL DEFAULT 'message',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create updated activity log table for halal financing
CREATE TABLE public.halal_financing_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  halal_financing_request_id uuid NOT NULL REFERENCES public.halal_financing_requests(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL,
  action_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create updated doc requests table for halal financing
CREATE TABLE public.halal_finance_doc_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  halal_financing_request_id uuid NOT NULL REFERENCES public.halal_financing_requests(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'normal',
  deadline_at timestamp with time zone,
  requested_by uuid NOT NULL,
  file_url text,
  response_notes text,
  communication_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.halal_financing_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halal_financing_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halal_finance_doc_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for halal_financing_communications
CREATE POLICY "Users can view communications for their requests" ON public.halal_financing_communications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.halal_financing_requests hfr 
    WHERE hfr.id = halal_financing_communications.halal_financing_request_id 
    AND (hfr.user_id = auth.uid() OR hfr.responsible_person_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Authorized users can create communications" ON public.halal_financing_communications
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.halal_financing_requests hfr 
    WHERE hfr.id = halal_financing_communications.halal_financing_request_id 
    AND (hfr.user_id = auth.uid() OR hfr.responsible_person_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ) AND sender_id = auth.uid()
);

-- RLS policies for halal_financing_activity_log
CREATE POLICY "Users can view activity for their financing requests" ON public.halal_financing_activity_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.halal_financing_requests hfr 
    WHERE hfr.id = halal_financing_activity_log.halal_financing_request_id 
    AND (hfr.user_id = auth.uid() OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "System can insert activity logs" ON public.halal_financing_activity_log
FOR INSERT WITH CHECK (true);

-- RLS policies for halal_finance_doc_requests
CREATE POLICY "Users can view doc requests for their financing requests" ON public.halal_finance_doc_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.halal_financing_requests hfr 
    WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND (hfr.user_id = auth.uid() OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can respond to doc requests" ON public.halal_finance_doc_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.halal_financing_requests hfr 
    WHERE hfr.id = halal_finance_doc_requests.halal_financing_request_id 
    AND hfr.user_id = auth.uid()
  )
);

CREATE POLICY "Moderators and admins can manage doc requests" ON public.halal_finance_doc_requests
FOR ALL USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for financing request timestamp
CREATE OR REPLACE FUNCTION public.update_halal_financing_request_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.halal_financing_requests 
  SET updated_at = now() 
  WHERE id = NEW.halal_financing_request_id;
  RETURN NEW;
END;
$function$;

-- Triggers for timestamp updates
CREATE TRIGGER update_halal_financing_timestamp_on_communication
  AFTER INSERT ON public.halal_financing_communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halal_financing_request_timestamp();

CREATE TRIGGER update_halal_financing_timestamp_on_activity
  AFTER INSERT ON public.halal_financing_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halal_financing_request_timestamp();

-- Update notification trigger for stage changes
CREATE OR REPLACE FUNCTION public.fn_notify_halal_financing_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    -- Notify user of stage changes
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    VALUES (
      NEW.user_id,
      'financing:stage_change',
      'Financing Request Update',
      'Your financing request status has been updated to: ' || NEW.stage,
      'halal_financing_request',
      NEW.id,
      jsonb_build_object('stage', NEW.stage, 'previous_stage', OLD.stage)
    );
    
    -- Notify responsible person if assigned
    IF NEW.responsible_person_id IS NOT NULL AND NEW.responsible_person_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      VALUES (
        NEW.responsible_person_id,
        'financing:assigned',
        'Financing Request Assigned',
        'A financing request has been assigned to you',
        'halal_financing_request',
        NEW.id,
        jsonb_build_object('stage', NEW.stage)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER halal_financing_stage_change_trigger
  AFTER UPDATE ON public.halal_financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_halal_financing_stage_change();