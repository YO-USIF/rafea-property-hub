-- إصلاح مشكلة Security Definer View
-- حذف العرض الحالي وإنشاء نسخة محسنة

DROP VIEW IF EXISTS public.sales_secure;

-- إنشاء عرض آمن جديد بدون استخدام SECURITY DEFINER functions
CREATE VIEW public.sales_secure AS
SELECT 
  id,
  user_id,
  project_name,
  unit_number,
  unit_type,
  area,
  price,
  sale_date,
  remaining_amount,
  status,
  installment_plan,
  created_at,
  updated_at,
  -- إخفاء البيانات الشخصية للعملاء بناءً على المستخدم الحالي فقط
  CASE 
    WHEN auth.uid() = user_id THEN customer_name
    ELSE '*** محجوب ***'
  END AS customer_name,
  CASE 
    WHEN auth.uid() = user_id THEN customer_phone
    ELSE '*** محجوب ***'
  END AS customer_phone
FROM public.sales
WHERE auth.uid() = user_id;