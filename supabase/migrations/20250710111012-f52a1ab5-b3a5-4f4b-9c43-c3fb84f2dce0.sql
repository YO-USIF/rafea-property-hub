-- إنشاء دليل الحسابات المحاسبية
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('أصول', 'خصوم', 'حقوق الملكية', 'إيرادات', 'مصروفات')),
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول القيود اليومية
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_number TEXT NOT NULL UNIQUE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('sale', 'invoice', 'purchase', 'manual')),
  reference_id UUID,
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول تفاصيل القيود
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  description TEXT,
  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول التقارير المالية المحفوظة
CREATE TABLE public.financial_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('income_statement', 'balance_sheet', 'cash_flow')),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  report_data JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج الحسابات الأساسية
INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- الأصول
('1000', 'الأصول', 'أصول', 'مجموعة الأصول الرئيسية'),
('1100', 'الأصول المتداولة', 'أصول', 'النقدية والأصول قصيرة الأجل'),
('1110', 'النقدية', 'أصول', 'النقد في الصندوق والبنك'),
('1120', 'المدينون', 'أصول', 'المبالغ المستحقة من العملاء'),
('1200', 'الأصول الثابتة', 'أصول', 'العقارات والمباني والمعدات'),

-- الخصوم
('2000', 'الخصوم', 'خصوم', 'مجموعة الخصوم الرئيسية'),
('2100', 'الخصوم المتداولة', 'خصوم', 'الالتزامات قصيرة الأجل'),
('2110', 'الدائنون', 'خصوم', 'المبالغ المستحقة للموردين'),
('2120', 'مصروفات مستحقة', 'خصوم', 'المصروفات غير المدفوعة'),

-- حقوق الملكية
('3000', 'حقوق الملكية', 'حقوق الملكية', 'رأس المال والأرباح المحتجزة'),
('3100', 'رأس المال', 'حقوق الملكية', 'رأس المال المدفوع'),
('3200', 'الأرباح المحتجزة', 'حقوق الملكية', 'الأرباح المتراكمة'),

-- الإيرادات
('4000', 'الإيرادات', 'إيرادات', 'مجموعة الإيرادات الرئيسية'),
('4100', 'إيرادات المبيعات', 'إيرادات', 'إيرادات بيع الشقق والعقارات'),
('4200', 'إيرادات أخرى', 'إيرادات', 'الإيرادات الأخرى'),

-- المصروفات
('5000', 'المصروفات', 'مصروفات', 'مجموعة المصروفات الرئيسية'),
('5100', 'تكلفة البضاعة المباعة', 'مصروفات', 'التكلفة المباشرة للمبيعات'),
('5200', 'المصروفات التشغيلية', 'مصروفات', 'مصروفات التشغيل اليومية'),
('5210', 'مصروفات الصيانة', 'مصروفات', 'تكاليف الصيانة والإصلاحات'),
('5220', 'مصروفات إدارية', 'مصروفات', 'المصروفات الإدارية العامة'),
('5230', 'مصروفات التسويق', 'مصروفات', 'تكاليف التسويق والإعلان');

-- تمكين RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لدليل الحسابات
CREATE POLICY "Users can view chart of accounts"
ON public.chart_of_accounts FOR SELECT
USING (true);

CREATE POLICY "Admin users can manage chart of accounts"
ON public.chart_of_accounts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- سياسات الأمان للقيود اليومية
CREATE POLICY "Users can view journal entries"
ON public.journal_entries FOR SELECT
USING (is_admin() OR is_manager_or_admin() OR created_by = auth.uid());

CREATE POLICY "Users can create journal entries"
ON public.journal_entries FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admin users can update journal entries"
ON public.journal_entries FOR UPDATE
USING (is_admin() OR (is_manager_or_admin() AND created_by = auth.uid()));

-- سياسات الأمان لتفاصيل القيود
CREATE POLICY "Users can view journal entry lines"
ON public.journal_entry_lines FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.journal_entries je 
  WHERE je.id = journal_entry_lines.journal_entry_id 
  AND (is_admin() OR is_manager_or_admin() OR je.created_by = auth.uid())
));

CREATE POLICY "Users can manage journal entry lines"
ON public.journal_entry_lines FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.journal_entries je 
  WHERE je.id = journal_entry_lines.journal_entry_id 
  AND je.created_by = auth.uid()
));

-- سياسات الأمان للتقارير المالية
CREATE POLICY "Users can view financial reports"
ON public.financial_reports FOR SELECT
USING (is_admin() OR is_manager_or_admin() OR created_by = auth.uid());

CREATE POLICY "Users can create financial reports"
ON public.financial_reports FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_chart_of_accounts_updated_at
BEFORE UPDATE ON public.chart_of_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء دالة للتحقق من توازن القيد
CREATE OR REPLACE FUNCTION public.validate_journal_entry_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من أن إجمالي المدين = إجمالي الدائن
  UPDATE public.journal_entries 
  SET 
    total_debit = (SELECT COALESCE(SUM(debit_amount), 0) FROM public.journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id),
    total_credit = (SELECT COALESCE(SUM(credit_amount), 0) FROM public.journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id)
  WHERE id = NEW.journal_entry_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger للتحقق من التوازن
CREATE TRIGGER validate_journal_balance
AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION public.validate_journal_entry_balance();

-- إنشاء دالة لإنشاء قيد من المبيعة
CREATE OR REPLACE FUNCTION public.create_sale_journal_entry(
  sale_id UUID,
  sale_amount DECIMAL,
  customer_name TEXT
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة لإنشاء قيد من الفاتورة
CREATE OR REPLACE FUNCTION public.create_invoice_journal_entry(
  invoice_id UUID,
  invoice_amount DECIMAL,
  supplier_name TEXT
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;