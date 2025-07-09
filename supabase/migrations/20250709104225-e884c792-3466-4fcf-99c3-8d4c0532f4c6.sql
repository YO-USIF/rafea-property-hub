-- تحديث سياسات RLS للسماح للمدراء برؤية جميع البيانات
-- إنشاء دالة للتحقق من كون المستخدم مدير
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('مدير النظام', 'مدير')
  );
END;
$$;

-- تحديث سياسات المشاريع
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view projects" ON public.projects
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات المبيعات
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
CREATE POLICY "Users can view sales" ON public.sales
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات المشتريات
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view purchases" ON public.purchases
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات المهام
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view tasks" ON public.tasks
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات الموردين
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.suppliers;
CREATE POLICY "Users can view suppliers" ON public.suppliers
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات المقاولين
DROP POLICY IF EXISTS "Users can view their own contractors" ON public.contractors;
CREATE POLICY "Users can view contractors" ON public.contractors
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);

-- تحديث سياسات طلبات الصيانة
DROP POLICY IF EXISTS "Users can view their own maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Users can view maintenance requests" ON public.maintenance_requests
FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_admin()
);