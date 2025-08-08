-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create rejected_properties table to archive rejected listings
CREATE TABLE IF NOT EXISTS public.rejected_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  title text,
  description text,
  location text,
  price numeric,
  bedrooms integer,
  bathrooms integer,
  area numeric,
  property_type text,
  image_url text,
  photos jsonb DEFAULT '[]'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  latitude numeric,
  longitude numeric,
  previous_status text,
  reject_reason text,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rejected_properties ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- SELECT for admins and moderators
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'rejected_properties' AND policyname = 'Admins and moderators can view rejected properties'
  ) THEN
    CREATE POLICY "Admins and moderators can view rejected properties"
      ON public.rejected_properties
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      );
  END IF;

  -- INSERT via moderators/admins (used by trigger after review)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'rejected_properties' AND policyname = 'Admins and moderators can insert via trigger'
  ) THEN
    CREATE POLICY "Admins and moderators can insert via trigger"
      ON public.rejected_properties
      FOR INSERT
      WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      );
  END IF;

  -- UPDATE only by admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'rejected_properties' AND policyname = 'Only admins can update rejected properties'
  ) THEN
    CREATE POLICY "Only admins can update rejected properties"
      ON public.rejected_properties
      FOR UPDATE
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  -- DELETE only by admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'rejected_properties' AND policyname = 'Only admins can delete rejected properties'
  ) THEN
    CREATE POLICY "Only admins can delete rejected properties"
      ON public.rejected_properties
      FOR DELETE
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rejected_properties_property_id ON public.rejected_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_rejected_properties_user_id ON public.rejected_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_rejected_properties_rejected_at ON public.rejected_properties(rejected_at);

-- Triggers to keep table in sync when a property becomes rejected
-- Attach trigger to auto-deny halal financing on reject (function already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_auto_deny_halal_on_reject'
  ) THEN
    CREATE TRIGGER trg_auto_deny_halal_on_reject
    AFTER UPDATE OF status ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_deny_halal_on_reject();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_log_rejected_property'
  ) THEN
    CREATE TRIGGER trg_log_rejected_property
    AFTER UPDATE OF status ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.log_rejected_property();
  END IF;
END $$;