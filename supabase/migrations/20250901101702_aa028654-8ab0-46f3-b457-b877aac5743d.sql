-- Fix search path security warnings by updating functions
CREATE OR REPLACE FUNCTION public.update_financing_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.financing_requests 
  SET updated_at = now() 
  WHERE id = NEW.financing_request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';