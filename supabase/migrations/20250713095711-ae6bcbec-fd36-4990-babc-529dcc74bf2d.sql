-- إضافة حقل project_id إلى جدول extracts
ALTER TABLE public.extracts ADD COLUMN project_id uuid REFERENCES public.projects(id);

-- إضافة فهرس للأداء
CREATE INDEX idx_extracts_project_id ON public.extracts(project_id);

-- إنشاء دالة لخصم مبلغ المستخلص من المبيعات
CREATE OR REPLACE FUNCTION public.create_extract_journal_entry(
  extract_id uuid, 
  extract_amount numeric, 
  contractor_name text,
  project_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  WHERE account_code = '2120' -- حساب مستحقات المقاولين
  LIMIT 1;
  
  -- إضافة السطر الدائن (خصم من المبيعات أو من حساب المشاريع تحت التنفيذ)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'خصم مستخلص من المبيعات - ' || contractor_name, extract_amount
  FROM public.chart_of_accounts 
  WHERE account_code = '4100' -- حساب إيرادات المبيعات
  LIMIT 1;
  
  -- إذا كان هناك مشروع محدد، قم بتحديث إجمالي التكاليف في المشروع
  IF project_id IS NOT NULL THEN
    UPDATE public.projects 
    SET total_cost = COALESCE(total_cost, 0) + extract_amount
    WHERE id = project_id;
  END IF;
  
  RETURN entry_id;
END;
$$;