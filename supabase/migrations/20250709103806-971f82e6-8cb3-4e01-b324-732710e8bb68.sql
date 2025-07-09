-- إنشاء ملفات تعريف للمستخدمين الحاليين
INSERT INTO public.profiles (user_id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);

-- تعيين دور افتراضي لكل مستخدم
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'موظف'::user_role FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);

-- تعيين أول مستخدم كمدير نظام
UPDATE public.user_roles 
SET role = 'مدير النظام'::user_role 
WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);