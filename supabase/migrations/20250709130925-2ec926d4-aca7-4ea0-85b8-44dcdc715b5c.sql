-- إنشاء جدول الفواتير 
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'غير مدفوع',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات للفواتير
CREATE POLICY "Users can create their own invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view invoices" 
ON public.invoices 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_admin() OR 
  (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'مدير'
    ) 
    AND 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = invoices.user_id 
      AND user_roles.role = ANY(ARRAY['مدير'::user_role, 'موظف مبيعات'::user_role, 'محاسب'::user_role, 'موظف'::user_role])
    )
  )
);

CREATE POLICY "Users can update their own invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
ON public.invoices 
FOR DELETE 
USING (auth.uid() = user_id);

-- إنشاء تريجر لتحديث updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();