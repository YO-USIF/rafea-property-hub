-- إنشاء جدول المبيعات
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  area INTEGER NOT NULL,
  price INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'متاح',
  sale_date DATE,
  installment_plan TEXT,
  remaining_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المهام
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT NOT NULL,
  department TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'متوسطة',
  status TEXT NOT NULL DEFAULT 'جديدة',
  due_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاف جدول المشتريات
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery DATE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'في انتظار الموافقة',
  approved_by TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'لم يتم التسليم',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول عناصر المشتريات
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للمبيعات
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- إنشاء سياسات RLS للمهام
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- إنشاء سياسات RLS للمشتريات
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchases" ON public.purchases FOR DELETE USING (auth.uid() = user_id);

-- إنشاء سياسات RLS لعناصر المشتريات
CREATE POLICY "Users can view purchase items" ON public.purchase_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.purchases WHERE id = purchase_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create purchase items" ON public.purchase_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.purchases WHERE id = purchase_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update purchase items" ON public.purchase_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.purchases WHERE id = purchase_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete purchase items" ON public.purchase_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.purchases WHERE id = purchase_id AND user_id = auth.uid())
);

-- إنشاء triggers للتحديث التلقائي لـ updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();