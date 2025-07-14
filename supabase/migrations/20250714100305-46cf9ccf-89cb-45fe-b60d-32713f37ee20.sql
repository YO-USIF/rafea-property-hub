-- تحديث صلاحيات المشتريات للسماح للمدراء بالتعديل والحذف
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.purchases;

-- إنشاء صلاحيات جديدة للمشتريات
CREATE POLICY "Users can update purchases" ON public.purchases
FOR UPDATE USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

CREATE POLICY "Users can delete purchases" ON public.purchases  
FOR DELETE USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- تحديث صلاحيات الفواتير للسماح للمدراء بالتعديل والحذف
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can update invoices" ON public.invoices
FOR UPDATE USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

CREATE POLICY "Users can delete invoices" ON public.invoices
FOR DELETE USING (
  auth.uid() = user_id OR is_manager_or_admin()
);