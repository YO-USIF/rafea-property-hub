-- حذف السياسة القديمة للتحديث
DROP POLICY IF EXISTS "Users can update their own extracts" ON public.extracts;

-- إنشاء سياسة جديدة تسمح لمدير النظام والمدراء بالتعديل أيضاً
CREATE POLICY "Users can update extracts"
ON public.extracts
FOR UPDATE
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- حذف السياسة القديمة للحذف
DROP POLICY IF EXISTS "Users can delete their own extracts" ON public.extracts;

-- إنشاء سياسة جديدة تسمح لمدير النظام والمدراء بالحذف أيضاً
CREATE POLICY "Users can delete extracts"
ON public.extracts
FOR DELETE
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);