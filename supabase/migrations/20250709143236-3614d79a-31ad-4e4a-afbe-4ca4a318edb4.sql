-- تحديث سياسات الأمان للمشاريع لتسمح للمدراء برؤية جميع البيانات
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;

CREATE POLICY "Users can view projects" 
ON public.projects 
FOR SELECT 
USING (
  -- مدير النظام يرى كل شيء
  is_admin() OR 
  -- المدراء يرون كل شيء
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير'::user_role
  )) OR
  -- صاحب المشروع يرى مشروعه
  (auth.uid() = user_id)
);

-- تحديث سياسات الأمان لطلبات الصيانة
DROP POLICY IF EXISTS "Users can view maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Users can view maintenance requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (
  -- مدير النظام يرى كل شيء
  is_admin() OR 
  -- المدراء يرون كل شيء
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير'::user_role
  )) OR
  -- صاحب الطلب يرى طلبه
  (auth.uid() = user_id)
);

-- تحديث سياسات الأمان للمقاولين
DROP POLICY IF EXISTS "Users can view contractors" ON public.contractors;

CREATE POLICY "Users can view contractors" 
ON public.contractors 
FOR SELECT 
USING (
  -- مدير النظام يرى كل شيء
  is_admin() OR 
  -- المدراء يرون كل شيء
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير'::user_role
  )) OR
  -- صاحب المقاول يرى مقاوله
  (auth.uid() = user_id)
);

-- تحديث سياسات الأمان للموردين
DROP POLICY IF EXISTS "Users can view suppliers" ON public.suppliers;

CREATE POLICY "Users can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (
  -- مدير النظام يرى كل شيء
  is_admin() OR 
  -- المدراء يرون كل شيء
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير'::user_role
  )) OR
  -- صاحب المورد يرى مورده
  (auth.uid() = user_id)
);

-- تحديث سياسات الأمان للمهام
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;

CREATE POLICY "Users can view tasks" 
ON public.tasks 
FOR SELECT 
USING (
  -- مدير النظام يرى كل شيء
  is_admin() OR 
  -- المدراء يرون كل شيء
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير'::user_role
  )) OR
  -- صاحب المهمة يرى مهمته
  (auth.uid() = user_id)
);