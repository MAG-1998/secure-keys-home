-- Add phone number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT;

-- Create index for phone number lookups
CREATE INDEX idx_profiles_phone ON public.profiles(phone);