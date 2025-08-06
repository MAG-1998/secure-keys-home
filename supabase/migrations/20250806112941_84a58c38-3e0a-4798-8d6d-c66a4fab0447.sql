-- Create audit logging table for role changes
CREATE TABLE public.role_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.role_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.role_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create payment audit table
CREATE TABLE public.payment_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  order_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment audit
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment logs
CREATE POLICY "Users can view their own payment logs" 
ON public.payment_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all payment logs
CREATE POLICY "Admins can view all payment logs" 
ON public.payment_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert payment logs
CREATE POLICY "System can insert payment logs" 
ON public.payment_audit_log 
FOR INSERT 
WITH CHECK (true);