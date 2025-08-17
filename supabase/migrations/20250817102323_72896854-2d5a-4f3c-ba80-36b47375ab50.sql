-- COMPREHENSIVE SECURITY FIX: Replace overly permissive policies with proper role-based access control
-- This fixes critical security vulnerabilities where sensitive customer, contractor, and supplier data was publicly accessible

-- 1. SALES TABLE - Protect customer personal information (names, phone numbers)
DROP POLICY IF EXISTS "All users can view all sales" ON sales;
CREATE POLICY "Users can view authorized sales data" 
ON sales 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 2. CONTRACTORS TABLE - Protect contractor contact information
DROP POLICY IF EXISTS "All users can view all contractors" ON contractors;
CREATE POLICY "Users can view authorized contractor data" 
ON contractors 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 3. SUPPLIERS TABLE - Protect supplier contact information  
DROP POLICY IF EXISTS "All users can view all suppliers" ON suppliers;
CREATE POLICY "Users can view authorized supplier data" 
ON suppliers 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 4. EXTRACTS TABLE - Protect financial and contractor information
DROP POLICY IF EXISTS "All users can view all extracts" ON extracts;
CREATE POLICY "Users can view authorized extract data" 
ON extracts 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 5. INVOICES TABLE - Protect supplier and financial information
DROP POLICY IF EXISTS "All users can view all invoices" ON invoices;
CREATE POLICY "Users can view authorized invoice data" 
ON invoices 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 6. PURCHASES TABLE - Protect supplier and financial information
DROP POLICY IF EXISTS "All users can view all purchases" ON purchases;
CREATE POLICY "Users can view authorized purchase data" 
ON purchases 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 7. MAINTENANCE REQUESTS - Protect customer/tenant information
DROP POLICY IF EXISTS "All users can view all maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can view authorized maintenance data" 
ON maintenance_requests 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 8. TASKS - Protect internal task information
DROP POLICY IF EXISTS "All users can view all tasks" ON tasks;
CREATE POLICY "Users can view authorized task data" 
ON tasks 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- 9. PROJECTS TABLE - Keep some visibility for business operations but consider restricting sensitive data
-- Projects might need broader visibility for business operations, but we'll restrict to authenticated users
DROP POLICY IF EXISTS "All users can view all projects" ON projects;
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

-- 11. Secure journal entry functions
CREATE OR REPLACE FUNCTION public.create_sale_journal_entry(sale_id uuid, sale_amount numeric, customer_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
BEGIN
  -- إنشاء رقم القيد
  entry_number := 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد مبيعة - ' || customer_name,
    'sale',
    sale_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (المدينون)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مدين مبيعة - ' || customer_name, sale_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '1120';
  
  -- إضافة السطر الدائن (إيرادات المبيعات)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'إيراد مبيعة - ' || customer_name, sale_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '4100';
  
  RETURN entry_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_invoice_journal_entry(invoice_id uuid, invoice_amount numeric, supplier_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
BEGIN
  -- إنشاء رقم القيد
  entry_number := 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد فاتورة - ' || supplier_name,
    'invoice',
    invoice_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (مصروفات)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مصروف فاتورة - ' || supplier_name, invoice_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '5200';
  
  -- إضافة السطر الدائن (الدائنون)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'دائن فاتورة - ' || supplier_name, invoice_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '2110';
  
  RETURN entry_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_extract_journal_entry(extract_id uuid, extract_amount numeric, contractor_name text, project_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
  project_sales_total NUMERIC;
BEGIN
  -- إنشاء رقم القيد
  entry_number := 'JE-EXT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد مستخلص - ' || contractor_name,
    'extract',
    extract_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (مستحقات المقاولين)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مستحق مقاول - ' || contractor_name, extract_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '2120'
  LIMIT 1;
  
  -- إضافة السطر الدائن (خصم من المبيعات أو من حساب المشاريع تحت التنفيذ)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'خصم مستخلص من المبيعات - ' || contractor_name, extract_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '4100'
  LIMIT 1;
  
  -- إذا كان هناك مشروع محدد، قم بتحديث إجمالي التكاليف في المشروع
  IF project_id IS NOT NULL THEN
    UPDATE public.projects 
    SET total_cost = COALESCE(total_cost, 0) + extract_amount
    WHERE id = project_id;
  END IF;
  
  RETURN entry_id;
END;
$function$;