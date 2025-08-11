-- Add language preference to user profiles
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ru';

-- Optional: set a comment for clarity
COMMENT ON COLUMN public.profiles.language IS 'Preferred UI language code: en, ru, uz';