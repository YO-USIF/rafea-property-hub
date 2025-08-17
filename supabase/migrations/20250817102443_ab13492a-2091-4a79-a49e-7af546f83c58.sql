-- COMPREHENSIVE SECURITY FIX: Replace overly permissive policies with proper role-based access control
-- This fixes critical security vulnerabilities where sensitive customer, contractor, and supplier data was publicly accessible

-- 1. SALES TABLE - Protect customer personal information (names, phone numbers)
DROP POLICY IF EXISTS "All users can view all sales" ON sales;
DROP POLICY IF EXISTS "Users can view authorized sales data" ON sales;
CREATE POLICY "Users can view authorized sales data" 
ON sales 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 2. CONTRACTORS TABLE - Protect contractor contact information
DROP POLICY IF EXISTS "All users can view all contractors" ON contractors;
DROP POLICY IF EXISTS "Users can view authorized contractor data" ON contractors;
CREATE POLICY "Users can view authorized contractor data" 
ON contractors 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 3. SUPPLIERS TABLE - Protect supplier contact information  
DROP POLICY IF EXISTS "All users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can view authorized supplier data" ON suppliers;
CREATE POLICY "Users can view authorized supplier data" 
ON suppliers 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 4. EXTRACTS TABLE - Protect financial and contractor information
DROP POLICY IF EXISTS "All users can view all extracts" ON extracts;
DROP POLICY IF EXISTS "Users can view authorized extract data" ON extracts;
CREATE POLICY "Users can view authorized extract data" 
ON extracts 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 5. INVOICES TABLE - Protect supplier and financial information
DROP POLICY IF EXISTS "All users can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view authorized invoice data" ON invoices;
CREATE POLICY "Users can view authorized invoice data" 
ON invoices 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 6. PURCHASES TABLE - Protect supplier and financial information
DROP POLICY IF EXISTS "All users can view all purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view authorized purchase data" ON purchases;
CREATE POLICY "Users can view authorized purchase data" 
ON purchases 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 7. MAINTENANCE REQUESTS - Protect customer/tenant information
DROP POLICY IF EXISTS "All users can view all maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Users can view authorized maintenance data" ON maintenance_requests;
CREATE POLICY "Users can view authorized maintenance data" 
ON maintenance_requests 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 8. TASKS - Protect internal task information
DROP POLICY IF EXISTS "All users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view authorized task data" ON tasks;
CREATE POLICY "Users can view authorized task data" 
ON tasks 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 9. PROJECTS TABLE - Keep some visibility for business operations but consider restricting sensitive data
-- Projects might need broader visibility for business operations, but we'll restrict to authenticated users
DROP POLICY IF EXISTS "All users can view all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view project data" ON projects;
CREATE POLICY "Authenticated users can view project data" 
ON projects 
FOR SELECT 
USING (
  auth.role() = 'authenticated'
);

-- 10. Fix database functions security - Add search_path protection to prevent SQL injection
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير النظام'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('مدير النظام', 'مدير')
  );
END;
$function$;