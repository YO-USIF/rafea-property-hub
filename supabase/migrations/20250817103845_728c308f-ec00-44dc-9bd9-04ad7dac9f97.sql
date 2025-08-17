-- إصلاح مشكلة الأمان في جدول الملفات الشخصية
-- حذف السياسة الحالية التي تسمح بالوصول العام
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- إنشاء سياسة جديدة آمنة - المستخدمون يمكنهم رؤية ملفهم الشخصي فقط
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- إنشاء سياسة للمدراء ومديري النظام لعرض ملفات المستخدمين
CREATE POLICY "Managers can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_manager_or_admin());