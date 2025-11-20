-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Create granular policies for profile access

-- HR Managers can view all profiles
CREATE POLICY "HR managers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'مدير الموارد البشرية'
  )
);

-- System admins can view all profiles  
CREATE POLICY "System admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- Add audit logging table for profile access by HR managers
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID NOT NULL,
  profile_id UUID NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  action TEXT NOT NULL
);

ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admins can view profile access logs"
ON public.profile_access_logs
FOR SELECT
TO authenticated
USING (is_admin());

-- System can insert access logs
CREATE POLICY "System can insert profile access logs"
ON public.profile_access_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = accessed_by);