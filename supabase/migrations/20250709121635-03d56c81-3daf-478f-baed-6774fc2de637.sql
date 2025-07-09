-- تحديث سياسات الأمان للسماح للمدراء برؤية بيانات جميع المدراء

-- تحديث سياسة المشاريع
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;
CREATE POLICY "Users can view projects" ON public.projects
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = projects.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة المبيعات
DROP POLICY IF EXISTS "Users can view sales" ON public.sales;
CREATE POLICY "Users can view sales" ON public.sales
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = sales.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة الموردين
DROP POLICY IF EXISTS "Users can view suppliers" ON public.suppliers;
CREATE POLICY "Users can view suppliers" ON public.suppliers
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = suppliers.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة المقاولين
DROP POLICY IF EXISTS "Users can view contractors" ON public.contractors;
CREATE POLICY "Users can view contractors" ON public.contractors
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = contractors.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة المهام
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
CREATE POLICY "Users can view tasks" ON public.tasks
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = tasks.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة طلبات الصيانة
DROP POLICY IF EXISTS "Users can view maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Users can view maintenance requests" ON public.maintenance_requests
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = maintenance_requests.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);

-- تحديث سياسة المشتريات
DROP POLICY IF EXISTS "Users can view purchases" ON public.purchases;
CREATE POLICY "Users can view purchases" ON public.purchases
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (
    -- المدراء يمكنهم رؤية بيانات جميع المدراء والموظفين
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'مدير'
    ) AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = purchases.user_id AND role IN ('مدير', 'موظف مبيعات', 'محاسب', 'موظف')
    )
  )
);