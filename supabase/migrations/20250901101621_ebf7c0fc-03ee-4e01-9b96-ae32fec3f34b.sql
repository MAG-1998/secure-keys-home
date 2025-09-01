-- Add workflow fields to financing_requests table
ALTER TABLE public.financing_requests 
ADD COLUMN responsible_person_id uuid REFERENCES public.profiles(user_id),
ADD COLUMN stage text DEFAULT 'submitted' CHECK (stage IN ('submitted', 'assigned', 'document_collection', 'under_review', 'final_approval', 'approved', 'denied'));

-- Create financing_communications table for dataroom-style chat
CREATE TABLE public.financing_communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financing_request_id uuid NOT NULL REFERENCES public.financing_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(user_id),
  message_type text NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'document_request', 'document_response', 'status_update')),
  content text,
  file_urls jsonb DEFAULT '[]'::jsonb,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for financing_communications
ALTER TABLE public.financing_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view communications for their requests"
ON public.financing_communications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.financing_requests fr 
    WHERE fr.id = financing_communications.financing_request_id 
    AND (fr.user_id = auth.uid() OR fr.responsible_person_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Authorized users can create communications"
ON public.financing_communications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.financing_requests fr 
    WHERE fr.id = financing_communications.financing_request_id 
    AND (fr.user_id = auth.uid() OR fr.responsible_person_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
  AND sender_id = auth.uid()
);

-- Update finance_doc_requests with better status tracking
ALTER TABLE public.finance_doc_requests 
ADD COLUMN communication_id uuid REFERENCES public.financing_communications(id),
ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create trigger for updating financing_requests updated_at
CREATE OR REPLACE FUNCTION public.update_financing_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.financing_requests 
  SET updated_at = now() 
  WHERE id = NEW.financing_request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financing_request_on_communication
  AFTER INSERT ON public.financing_communications
  FOR EACH ROW EXECUTE FUNCTION public.update_financing_request_timestamp();

-- Add notification triggers for stage changes
CREATE OR REPLACE FUNCTION public.fn_notify_financing_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    -- Notify user of stage changes
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    VALUES (
      NEW.user_id,
      'financing:stage_change',
      'Financing Request Update',
      'Your financing request status has been updated to: ' || NEW.stage,
      'financing_request',
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
        'financing_request',
        NEW.id,
        jsonb_build_object('stage', NEW.stage)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financing_stage_change_notification
  AFTER UPDATE ON public.financing_requests
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_financing_stage_change();