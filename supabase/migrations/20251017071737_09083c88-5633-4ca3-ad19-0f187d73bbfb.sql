-- Add verification_notes column to profiles table for admin/moderator comments
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

COMMENT ON COLUMN public.profiles.verification_notes IS 'Admin/moderator comments on verification decision (visible to user)';