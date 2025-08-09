-- Create messages table for user-to-user messaging regarding properties
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz NULL
);

-- Add foreign keys to existing tables (properties and profiles)
ALTER TABLE public.messages
  ADD CONSTRAINT messages_property_id_fkey
  FOREIGN KEY (property_id)
  REFERENCES public.properties(id)
  ON DELETE SET NULL;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_recipient_id_fkey
  FOREIGN KEY (recipient_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read messages where they are sender or recipient"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Optional: allow recipients to mark messages as read (update read_at only)
CREATE POLICY "Recipients can update read_at"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id
);

-- Basic index for inbox queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created_at
ON public.messages (recipient_id, created_at DESC);
