-- Remove virtual_tour column from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS virtual_tour;