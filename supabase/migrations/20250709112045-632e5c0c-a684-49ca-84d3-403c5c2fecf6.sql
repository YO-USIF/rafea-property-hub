-- تصحيح بيانات المستخدمين وإضافة trigger لإنشاء ملفات تعريف تلقائية

-- حذف البيانات الخاطئة الحالية
DELETE FROM user_roles;
DELETE FROM profiles;

-- إنشاء ملفات تعريف للمستخدمين الموجودين
INSERT INTO profiles (user_id, email, full_name, status)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
  'نشط'
FROM auth.users
WHERE email IS NOT NULL;

-- إضافة الصلاحيات للمستخدمين
INSERT INTO user_roles (user_id, role) VALUES
  ('5efdcb10-c18d-4cf0-9e72-185623d0f537', 'مدير النظام'), -- wwork9575@gmail.com
  ('e7abd8e3-6015-4b20-870d-5284f861804b', 'مدير'), -- amarnory92@gmail.com  
  ('ed8f6918-a28d-43b7-93bf-995109dcb6bf', 'موظف'); -- ys41137@gmail.com

-- إنشاء trigger لإضافة المستخدمين الجدد تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إنشاء ملف تعريف المستخدم
  INSERT INTO public.profiles (user_id, full_name, email, status)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    NEW.email,
    'نشط'
  );
  
  -- إضافة صلاحية افتراضية
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'موظف');
  
  RETURN NEW;
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء trigger جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();