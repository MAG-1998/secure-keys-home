-- Allow users to view basic profile info of people they are chatting with
CREATE POLICY "Users can view chat participants' profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.messages m
    WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.user_id)
       OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.user_id)
  )
);