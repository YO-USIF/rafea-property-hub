-- حذف المستخدم reyad908@gmail.com من النظام

-- حذف الدور من user_roles
DELETE FROM public.user_roles 
WHERE user_id = '31cadf55-686c-4981-bd3c-d0dc2d008590';

-- حذف الملف الشخصي من profiles
DELETE FROM public.profiles 
WHERE user_id = '31cadf55-686c-4981-bd3c-d0dc2d008590';

-- ملاحظة: المستخدم سيظل موجوداً في auth.users ولكن لن يكون لديه صلاحيات أو بيانات في النظام
-- لحذفه بالكامل من auth.users، يجب استخدام لوحة تحكم Supabase