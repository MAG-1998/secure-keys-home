-- Enhanced Halal Financing Workflow Schema Updates

-- Add new columns to halal_financing_requests table
ALTER TABLE public.halal_financing_requests
ADD COLUMN IF NOT EXISTS admin_review_stage text DEFAULT 'initial',
ADD COLUMN IF NOT EXISTS sent_back_to_responsible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_back_notes text;

-- Create enum for workflow stages if not exists
DO $$ BEGIN
    CREATE TYPE financing_workflow_stage AS ENUM (
        'submitted',           -- Initial submission
        'assigned',           -- Admin has assigned responsible person
        'document_collection', -- Responsible person collecting documents
        'under_review',       -- Responsible person reviewing
        'final_approval',     -- Admin final review
        'approved',           -- Final approval
        'denied'              -- Final denial
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update stage column to use the enum
ALTER TABLE public.halal_financing_requests 
ALTER COLUMN stage TYPE financing_workflow_stage USING stage::financing_workflow_stage;

-- Set default stage
ALTER TABLE public.halal_financing_requests
ALTER COLUMN stage SET DEFAULT 'submitted'::financing_workflow_stage;

-- Add constraints to enforce workflow
CREATE OR REPLACE FUNCTION public.validate_financing_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Only admin can assign responsible person from submitted stage
    IF OLD.stage = 'submitted' AND NEW.stage = 'assigned' THEN
        IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only admins can assign responsible persons';
        END IF;
        IF NEW.responsible_person_id IS NULL THEN
            RAISE EXCEPTION 'Responsible person must be assigned when moving to assigned stage';
        END IF;
    END IF;

    -- Only responsible person can move from assigned to document_collection
    IF OLD.stage = 'assigned' AND NEW.stage = 'document_collection' THEN
        IF NEW.responsible_person_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only responsible person or admin can move to document collection stage';
        END IF;
    END IF;

    -- Only responsible person can move from document_collection to under_review
    IF OLD.stage = 'document_collection' AND NEW.stage = 'under_review' THEN
        IF NEW.responsible_person_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only responsible person or admin can move to under review stage';
        END IF;
    END IF;

    -- Only responsible person can submit for final approval
    IF OLD.stage = 'under_review' AND NEW.stage = 'final_approval' THEN
        IF NEW.responsible_person_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only responsible person or admin can submit for final approval';
        END IF;
    END IF;

    -- Only admin can make final approval/denial
    IF OLD.stage = 'final_approval' AND NEW.stage IN ('approved', 'denied') THEN
        IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only admins can make final approval/denial decisions';
        END IF;
    END IF;

    -- Admin can send back to responsible person from final_approval
    IF OLD.stage = 'final_approval' AND NEW.stage = 'under_review' AND NEW.sent_back_to_responsible = true THEN
        IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only admins can send back requests to responsible person';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for workflow validation
DROP TRIGGER IF EXISTS validate_financing_workflow_trigger ON public.halal_financing_requests;
CREATE TRIGGER validate_financing_workflow_trigger
    BEFORE UPDATE ON public.halal_financing_requests
    FOR EACH ROW EXECUTE FUNCTION public.validate_financing_workflow();

-- Add file upload column to halal_finance_doc_requests for user responses
ALTER TABLE public.halal_finance_doc_requests
ADD COLUMN IF NOT EXISTS user_file_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Update the workflow stage change notification function
CREATE OR REPLACE FUNCTION public.fn_notify_halal_financing_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS halal_financing_stage_change_trigger ON public.halal_financing_requests;
CREATE TRIGGER halal_financing_stage_change_trigger
    AFTER UPDATE ON public.halal_financing_requests
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_halal_financing_stage_change();