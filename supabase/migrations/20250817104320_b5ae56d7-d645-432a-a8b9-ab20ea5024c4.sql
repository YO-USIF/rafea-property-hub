-- Critical Security Fixes - Phase 1: Data Exposure Protection

-- Fix user_roles table - Remove public access, only authenticated users can view their own roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin());

-- Fix company_settings table - Restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view company settings" ON public.company_settings;

CREATE POLICY "Authenticated users can view company settings" 
ON public.company_settings 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fix task_reports table - Remove public access
DROP POLICY IF EXISTS "Users can view task reports" ON public.task_reports;

CREATE POLICY "Authenticated users can view task reports" 
ON public.task_reports 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fix chart_of_accounts table - Remove public access
DROP POLICY IF EXISTS "Users can view chart of accounts" ON public.chart_of_accounts;

CREATE POLICY "Authenticated users can view chart of accounts" 
ON public.chart_of_accounts 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Phase 2: Database Function Security - Prevent SQL Injection

-- Secure create_sale_journal_entry function
CREATE OR REPLACE FUNCTION public.create_sale_journal_entry(sale_id uuid, sale_amount numeric, customer_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
  sanitized_customer_name TEXT;
BEGIN
  -- Input validation and sanitization
  IF sale_amount <= 0 THEN
    RAISE EXCEPTION 'Sale amount must be positive';
  END IF;
  
  IF LENGTH(customer_name) > 255 THEN
    RAISE EXCEPTION 'Customer name too long';
  END IF;
  
  -- Sanitize customer name - remove potentially dangerous characters
  sanitized_customer_name := regexp_replace(customer_name, '[^\w\s\u0600-\u06FF-]', '', 'g');
  sanitized_customer_name := trim(sanitized_customer_name);
  
  IF sanitized_customer_name = '' THEN
    sanitized_customer_name := 'عميل غير محدد';
  END IF;
  
  -- إنشاء رقم القيد
  entry_number := 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد مبيعة - ' || sanitized_customer_name,
    'sale',
    sale_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (المدينون)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مدين مبيعة - ' || sanitized_customer_name, sale_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '1120';
  
  -- إضافة السطر الدائن (إيرادات المبيعات)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'إيراد مبيعة - ' || sanitized_customer_name, sale_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '4100';
  
  RETURN entry_id;
END;
$function$;

-- Secure create_invoice_journal_entry function
CREATE OR REPLACE FUNCTION public.create_invoice_journal_entry(invoice_id uuid, invoice_amount numeric, supplier_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
  sanitized_supplier_name TEXT;
BEGIN
  -- Input validation and sanitization
  IF invoice_amount <= 0 THEN
    RAISE EXCEPTION 'Invoice amount must be positive';
  END IF;
  
  IF LENGTH(supplier_name) > 255 THEN
    RAISE EXCEPTION 'Supplier name too long';
  END IF;
  
  -- Sanitize supplier name - remove potentially dangerous characters
  sanitized_supplier_name := regexp_replace(supplier_name, '[^\w\s\u0600-\u06FF-]', '', 'g');
  sanitized_supplier_name := trim(sanitized_supplier_name);
  
  IF sanitized_supplier_name = '' THEN
    sanitized_supplier_name := 'مورد غير محدد';
  END IF;
  
  -- إنشاء رقم القيد
  entry_number := 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد فاتورة - ' || sanitized_supplier_name,
    'invoice',
    invoice_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (مصروفات)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مصروف فاتورة - ' || sanitized_supplier_name, invoice_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '5200';
  
  -- إضافة السطر الدائن (الدائنون)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'دائن فاتورة - ' || sanitized_supplier_name, invoice_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '2110';
  
  RETURN entry_id;
END;
$function$;

-- Secure create_extract_journal_entry function
CREATE OR REPLACE FUNCTION public.create_extract_journal_entry(extract_id uuid, extract_amount numeric, contractor_name text, project_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  entry_id UUID;
  entry_number TEXT;
  sanitized_contractor_name TEXT;
BEGIN
  -- Input validation and sanitization
  IF extract_amount <= 0 THEN
    RAISE EXCEPTION 'Extract amount must be positive';
  END IF;
  
  IF LENGTH(contractor_name) > 255 THEN
    RAISE EXCEPTION 'Contractor name too long';
  END IF;
  
  -- Sanitize contractor name - remove potentially dangerous characters
  sanitized_contractor_name := regexp_replace(contractor_name, '[^\w\s\u0600-\u06FF-]', '', 'g');
  sanitized_contractor_name := trim(sanitized_contractor_name);
  
  IF sanitized_contractor_name = '' THEN
    sanitized_contractor_name := 'مقاول غير محدد';
  END IF;
  
  -- إنشاء رقم القيد
  entry_number := 'JE-EXT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- إنشاء القيد الرئيسي
  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد مستخلص - ' || sanitized_contractor_name,
    'extract',
    extract_id,
    auth.uid()
  ) RETURNING id INTO entry_id;
  
  -- إضافة السطر المدين (مستحقات المقاولين)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مستحق مقاول - ' || sanitized_contractor_name, extract_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '2120'
  LIMIT 1;
  
  -- إضافة السطر الدائن (خصم من المبيعات أو من حساب المشاريع تحت التنفيذ)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'خصم مستخلص من المبيعات - ' || sanitized_contractor_name, extract_amount
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