-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can update company settings" ON public.company_settings;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير النظام'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate user_roles policies without recursion
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);

CREATE POLICY "Admin users can insert roles" ON public.user_roles 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update roles" ON public.user_roles 
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin users can delete roles" ON public.user_roles 
FOR DELETE USING (public.is_admin());

-- Recreate company_settings policies without recursion
CREATE POLICY "Admin users can update company settings" ON public.company_settings 
FOR UPDATE USING (public.is_admin());