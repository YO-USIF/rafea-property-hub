-- تحديث RLS policies للسماح للمديرين برؤية بيانات المديرين الآخرين

-- تحديث policies المشاريع
DROP POLICY IF EXISTS "Users can view projects" ON projects;
CREATE POLICY "Users can view projects" 
ON projects 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  -- السماح للمديرين برؤية بيانات المديرين الآخرين
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = projects.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies المبيعات
DROP POLICY IF EXISTS "Users can view sales" ON sales;
CREATE POLICY "Users can view sales" 
ON sales 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = sales.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies المهام
DROP POLICY IF EXISTS "Users can view tasks" ON tasks;
CREATE POLICY "Users can view tasks" 
ON tasks 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = tasks.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies طلبات الصيانة
DROP POLICY IF EXISTS "Users can view maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can view maintenance requests" 
ON maintenance_requests 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = maintenance_requests.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies المقاولين
DROP POLICY IF EXISTS "Users can view contractors" ON contractors;
CREATE POLICY "Users can view contractors" 
ON contractors 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = contractors.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies الموردين
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
CREATE POLICY "Users can view suppliers" 
ON suppliers 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = suppliers.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);

-- تحديث policies المشتريات
DROP POLICY IF EXISTS "Users can view purchases" ON purchases;
CREATE POLICY "Users can view purchases" 
ON purchases 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin() OR
  EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = purchases.user_id
    AND ur1.role IN ('مدير النظام', 'مدير')
    AND ur2.role IN ('مدير النظام', 'مدير')
  )
);