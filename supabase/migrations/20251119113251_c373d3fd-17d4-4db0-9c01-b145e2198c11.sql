-- تحديث دور المستخدم reyad908@gmail.com من موظف إلى مدير
UPDATE public.user_roles
SET role = 'مدير'
WHERE user_id = '773cdbb4-5da8-459e-9d74-cd1c061a95d1';