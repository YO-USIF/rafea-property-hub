-- تحديث سياسة RLS للمستخلصات لتسمح لجميع المستخدمين برؤية البيانات المدخلة من مدير النظام
DROP POLICY IF EXISTS "Users can view extracts" ON public.extracts;

CREATE POLICY "Users can view extracts" 
ON public.extracts 
FOR SELECT 
USING (
  -- يمكن للمستخدم رؤية مستخلصاته الخاصة
  (auth.uid() = user_id) 
  OR 
  -- يمكن لمدير النظام رؤية جميع المستخلصات
  is_admin() 
  OR 
  -- يمكن للمديرين رؤية المستخلصات المدخلة من موظفيهم والمدراء
  (
    (EXISTS ( SELECT 1
     FROM user_roles
    WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'مدير'::user_role)))) 
    AND 
    (EXISTS ( SELECT 1
     FROM user_roles
    WHERE ((user_roles.user_id = extracts.user_id) AND (user_roles.role = ANY (ARRAY['مدير'::user_role, 'موظف مبيعات'::user_role, 'محاسب'::user_role, 'موظف'::user_role])))))
  )
  OR
  -- يمكن لجميع المستخدمين رؤية البيانات المدخلة من مدير النظام
  (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = extracts.user_id) AND (user_roles.role = 'مدير النظام'::user_role))))
);