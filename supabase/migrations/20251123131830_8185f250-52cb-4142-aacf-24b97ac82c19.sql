-- إزالة الحقول المضافة من جدول المستخلصات
ALTER TABLE public.extracts
DROP COLUMN IF EXISTS assignment_order,
DROP COLUMN IF EXISTS is_external_project;

-- إنشاء جدول أوامر التكليف
CREATE TABLE IF NOT EXISTS public.assignment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_id UUID,
  contractor_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_before_tax NUMERIC,
  tax_amount NUMERIC,
  tax_included BOOLEAN DEFAULT false,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'قيد التنفيذ',
  work_type TEXT,
  duration_days INTEGER,
  attached_file_url TEXT,
  attached_file_name TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_assignment_orders_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_assignment_orders_user_id ON public.assignment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_orders_project_id ON public.assignment_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_assignment_orders_order_date ON public.assignment_orders(order_date);

-- إنشاء وظيفة لتوليد رقم أمر التكليف تلقائياً
CREATE OR REPLACE FUNCTION public.generate_assignment_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  -- إذا كان رقم أمر التكليف موجوداً بالفعل، لا تعدله
  IF NEW.order_number IS NOT NULL AND NEW.order_number != '' THEN
    RETURN NEW;
  END IF;
  
  -- الحصول على السنة الحالية
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- الحصول على آخر رقم أمر تكليف في هذه السنة
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(order_number FROM '\d+$') AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_number
  FROM public.assignment_orders
  WHERE order_number ~ ('^AO-' || year_part || '-\d+$');
  
  -- إنشاء رقم أمر التكليف الجديد
  NEW.order_number := 'AO-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتوليد رقم أمر التكليف
DROP TRIGGER IF EXISTS trigger_generate_assignment_order_number ON public.assignment_orders;
CREATE TRIGGER trigger_generate_assignment_order_number
  BEFORE INSERT ON public.assignment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_assignment_order_number();

-- إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_assignment_orders_updated_at ON public.assignment_orders;
CREATE TRIGGER trigger_update_assignment_orders_updated_at
  BEFORE UPDATE ON public.assignment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- تفعيل RLS
ALTER TABLE public.assignment_orders ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لأوامر التكليف
DROP POLICY IF EXISTS "Allow SELECT on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow SELECT on assignment_orders based on permissions"
  ON public.assignment_orders FOR SELECT
  USING (
    is_admin() OR 
    check_user_permission(auth.uid(), 'assignment_orders'::text, 'view'::text) OR 
    (is_manager_or_admin() AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    )) OR 
    (auth.uid() = user_id AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    ))
  );

DROP POLICY IF EXISTS "Allow INSERT on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow INSERT on assignment_orders based on permissions"
  ON public.assignment_orders FOR INSERT
  WITH CHECK (
    is_admin() OR 
    check_user_permission(auth.uid(), 'assignment_orders'::text, 'create'::text) OR 
    (is_manager_or_admin() AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    )) OR 
    (auth.uid() = user_id AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    ))
  );

DROP POLICY IF EXISTS "Allow UPDATE on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow UPDATE on assignment_orders based on permissions"
  ON public.assignment_orders FOR UPDATE
  USING (
    is_admin() OR 
    check_user_permission(auth.uid(), 'assignment_orders'::text, 'edit'::text) OR 
    (is_manager_or_admin() AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    )) OR 
    (auth.uid() = user_id AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    ))
  );

DROP POLICY IF EXISTS "Allow DELETE on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow DELETE on assignment_orders based on permissions"
  ON public.assignment_orders FOR DELETE
  USING (
    is_admin() OR 
    check_user_permission(auth.uid(), 'assignment_orders'::text, 'delete'::text) OR 
    (is_manager_or_admin() AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    )) OR 
    (auth.uid() = user_id AND NOT EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'assignment_orders'
    ))
  );

-- إضافة تعليقات توضيحية
COMMENT ON TABLE public.assignment_orders IS 'جدول أوامر التكليف للأعمال اليومية في المشاريع';
COMMENT ON COLUMN public.assignment_orders.order_number IS 'رقم أمر التكليف (يتم إنشاؤه تلقائياً)';
COMMENT ON COLUMN public.assignment_orders.work_type IS 'نوع العمل (أعمال يومية، صيانة، إلخ)';
COMMENT ON COLUMN public.assignment_orders.duration_days IS 'مدة العمل بالأيام';