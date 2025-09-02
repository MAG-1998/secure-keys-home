-- Enhanced Halal Financing Workflow Schema Updates (Fixed)

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

-- Drop the default constraint first, then alter column type, then set new default
ALTER TABLE public.halal_financing_requests 
ALTER COLUMN stage DROP DEFAULT;

ALTER TABLE public.halal_financing_requests 
ALTER COLUMN stage TYPE financing_workflow_stage USING stage::financing_workflow_stage;

ALTER TABLE public.halal_financing_requests
ALTER COLUMN stage SET DEFAULT 'submitted'::financing_workflow_stage;

-- Add file upload column to halal_finance_doc_requests for user responses
ALTER TABLE public.halal_finance_doc_requests
ADD COLUMN IF NOT EXISTS user_file_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

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