-- Update the workflow stage change notification function with enhanced messaging
CREATE OR REPLACE FUNCTION public.fn_notify_halal_financing_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    -- Notify user of stage changes with detailed messages
    INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    VALUES (
      NEW.user_id,
      'financing:stage_change',
      CASE NEW.stage
        WHEN 'assigned' THEN 'Financing Request Assigned'
        WHEN 'document_collection' THEN 'Documents Required'
        WHEN 'under_review' THEN 'Under Review'
        WHEN 'final_approval' THEN 'Final Approval Stage'
        WHEN 'approved' THEN 'Financing Request Approved!'
        WHEN 'denied' THEN 'Financing Request Decision'
        ELSE 'Financing Request Update'
      END,
      CASE NEW.stage
        WHEN 'assigned' THEN 'Your financing request has been assigned to a specialist for review'
        WHEN 'document_collection' THEN 'Please provide the requested documents to proceed with your financing request'
        WHEN 'under_review' THEN 'Your financing request is being reviewed by our specialist'
        WHEN 'final_approval' THEN 'Your financing request is in final approval stage'
        WHEN 'approved' THEN 'Congratulations! Your financing request has been approved. Please contact our office to proceed'
        WHEN 'denied' THEN 'Your financing request decision is available. Please check the details'
        ELSE 'Your financing request status has been updated to: ' || NEW.stage
      END,
      'halal_financing_request',
      NEW.id,
      jsonb_build_object('stage', NEW.stage, 'previous_stage', OLD.stage)
    );
    
    -- Notify responsible person if assigned and it's a new assignment
    IF NEW.responsible_person_id IS NOT NULL 
       AND NEW.responsible_person_id != NEW.user_id 
       AND (OLD.responsible_person_id IS NULL OR OLD.responsible_person_id != NEW.responsible_person_id) THEN
      INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      VALUES (
        NEW.responsible_person_id,
        'financing:assigned',
        'New Financing Request Assigned',
        'A financing request has been assigned to you for review',
        'halal_financing_request',
        NEW.id,
        jsonb_build_object('stage', NEW.stage)
      );
    END IF;

    -- Notify admin when request reaches final approval stage
    IF NEW.stage = 'final_approval' THEN
      INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      SELECT 
        p.user_id,
        'financing:final_approval',
        'Financing Request Ready for Final Approval',
        'A financing request has been submitted for your final approval',
        'halal_financing_request',
        NEW.id,
        jsonb_build_object('responsible_person_id', NEW.responsible_person_id)
      FROM public.profiles p
      WHERE p.role = 'admin'::public.app_role;
    END IF;

    -- Notify responsible person when admin sends back request
    IF NEW.sent_back_to_responsible = true AND OLD.sent_back_to_responsible = false THEN
      INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      VALUES (
        NEW.responsible_person_id,
        'financing:sent_back',
        'Financing Request Returned',
        'A financing request has been returned to you by admin for further review',
        'halal_financing_request',
        NEW.id,
        jsonb_build_object('sent_back_notes', NEW.sent_back_notes)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;