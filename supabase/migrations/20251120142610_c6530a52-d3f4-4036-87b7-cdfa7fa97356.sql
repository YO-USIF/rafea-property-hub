
-- ===============================================
-- الحل الجذري: تحديث RLS policies لجميع الجداول
-- لتأخذ في الاعتبار جدول user_permissions
-- ===============================================

-- 1. حذف السياسات القديمة على جدول sales
DROP POLICY IF EXISTS "Managers can view sales data" ON public.sales;
DROP POLICY IF EXISTS "Users can view their own sales data" ON public.sales;
DROP POLICY IF EXISTS "Users can create their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;

-- 2. إنشاء سياسات جديدة على جدول sales تستخدم check_user_permission
CREATE POLICY "Allow SELECT based on permissions"
ON public.sales
FOR SELECT
TO authenticated
USING (
  -- مدير النظام لديه وصول كامل
  public.is_admin()
  OR
  -- المستخدمون الذين لديهم صلاحية عرض في user_permissions
  public.check_user_permission(auth.uid(), 'sales', 'view')
  OR
  -- المدراء يمكنهم عرض جميع البيانات
  (
    public.is_manager_or_admin() 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
  OR
  -- المستخدمون يمكنهم عرض بياناتهم الخاصة
  (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
);

CREATE POLICY "Allow INSERT based on permissions"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  -- مدير النظام لديه وصول كامل
  public.is_admin()
  OR
  -- المستخدمون الذين لديهم صلاحية إنشاء في user_permissions
  public.check_user_permission(auth.uid(), 'sales', 'create')
  OR
  -- المدراء يمكنهم الإنشاء
  (
    public.is_manager_or_admin()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
  OR
  -- المستخدمون يمكنهم إنشاء بياناتهم الخاصة
  (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
);

CREATE POLICY "Allow UPDATE based on permissions"
ON public.sales
FOR UPDATE
TO authenticated
USING (
  -- مدير النظام لديه وصول كامل
  public.is_admin()
  OR
  -- المستخدمون الذين لديهم صلاحية تعديل في user_permissions
  public.check_user_permission(auth.uid(), 'sales', 'edit')
  OR
  -- المدراء يمكنهم التعديل
  (
    public.is_manager_or_admin()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
  OR
  -- المستخدمون يمكنهم تعديل بياناتهم الخاصة
  (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
);

CREATE POLICY "Allow DELETE based on permissions"
ON public.sales
FOR DELETE
TO authenticated
USING (
  -- مدير النظام لديه وصول كامل
  public.is_admin()
  OR
  -- المستخدمون الذين لديهم صلاحية حذف في user_permissions
  public.check_user_permission(auth.uid(), 'sales', 'delete')
  OR
  -- المدراء يمكنهم الحذف
  (
    public.is_manager_or_admin()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
  OR
  -- المستخدمون يمكنهم حذف بياناتهم الخاصة
  (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND page_name = 'sales'
    )
  )
);

-- 3. تطبيق نفس المنطق على جدول projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Managers can view all projects" ON public.projects;

CREATE POLICY "Allow SELECT on projects based on permissions"
ON public.projects FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'projects', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
);

CREATE POLICY "Allow INSERT on projects based on permissions"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'projects', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
);

CREATE POLICY "Allow UPDATE on projects based on permissions"
ON public.projects FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'projects', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
);

CREATE POLICY "Allow DELETE on projects based on permissions"
ON public.projects FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'projects', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'projects'))
);

-- 4. تطبيق نفس المنطق على جدول purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can create their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Managers can view all purchases" ON public.purchases;

CREATE POLICY "Allow SELECT on purchases based on permissions"
ON public.purchases FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
);

CREATE POLICY "Allow INSERT on purchases based on permissions"
ON public.purchases FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
);

CREATE POLICY "Allow UPDATE on purchases based on permissions"
ON public.purchases FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
);

CREATE POLICY "Allow DELETE on purchases based on permissions"
ON public.purchases FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'purchases'))
);

-- 5. تطبيق نفس المنطق على جدول extracts
DROP POLICY IF EXISTS "Users can view their own extracts" ON public.extracts;
DROP POLICY IF EXISTS "Users can create their own extracts" ON public.extracts;
DROP POLICY IF EXISTS "Users can update their own extracts" ON public.extracts;
DROP POLICY IF EXISTS "Users can delete their own extracts" ON public.extracts;
DROP POLICY IF EXISTS "Managers can view all extracts" ON public.extracts;
DROP POLICY IF EXISTS "Project managers can view extracts" ON public.extracts;
DROP POLICY IF EXISTS "Project managers can create review extracts" ON public.extracts;

CREATE POLICY "Allow SELECT on extracts based on permissions"
ON public.extracts FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'extracts', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
);

CREATE POLICY "Allow INSERT on extracts based on permissions"
ON public.extracts FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'extracts', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
);

CREATE POLICY "Allow UPDATE on extracts based on permissions"
ON public.extracts FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'extracts', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
);

CREATE POLICY "Allow DELETE on extracts based on permissions"
ON public.extracts FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'extracts', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'extracts'))
);

-- 6. تطبيق نفس المنطق على جدول contractors
DROP POLICY IF EXISTS "Users can view their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can create their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can update their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can delete their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Managers can view all contractors" ON public.contractors;

CREATE POLICY "Allow SELECT on contractors based on permissions"
ON public.contractors FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'contractors', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
);

CREATE POLICY "Allow INSERT on contractors based on permissions"
ON public.contractors FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'contractors', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
);

CREATE POLICY "Allow UPDATE on contractors based on permissions"
ON public.contractors FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'contractors', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
);

CREATE POLICY "Allow DELETE on contractors based on permissions"
ON public.contractors FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'contractors', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'contractors'))
);

-- 7. تطبيق نفس المنطق على جدول warehouse_inventory
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can create their own inventory" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Managers can view all inventory" ON public.warehouse_inventory;

CREATE POLICY "Allow SELECT on warehouse_inventory based on permissions"
ON public.warehouse_inventory FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow INSERT on warehouse_inventory based on permissions"
ON public.warehouse_inventory FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow UPDATE on warehouse_inventory based on permissions"
ON public.warehouse_inventory FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow DELETE on warehouse_inventory based on permissions"
ON public.warehouse_inventory FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

-- 8. تطبيق نفس المنطق على جدول warehouse_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Managers can view all transactions" ON public.warehouse_transactions;

CREATE POLICY "Allow SELECT on warehouse_transactions based on permissions"
ON public.warehouse_transactions FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow INSERT on warehouse_transactions based on permissions"
ON public.warehouse_transactions FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow UPDATE on warehouse_transactions based on permissions"
ON public.warehouse_transactions FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

CREATE POLICY "Allow DELETE on warehouse_transactions based on permissions"
ON public.warehouse_transactions FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'warehouse', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'warehouse'))
);

-- 9. تطبيق نفس المنطق على جدول tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers can view all tasks" ON public.tasks;

CREATE POLICY "Allow SELECT on tasks based on permissions"
ON public.tasks FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'tasks', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
);

CREATE POLICY "Allow INSERT on tasks based on permissions"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'tasks', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
);

CREATE POLICY "Allow UPDATE on tasks based on permissions"
ON public.tasks FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'tasks', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
);

CREATE POLICY "Allow DELETE on tasks based on permissions"
ON public.tasks FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'tasks', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'tasks'))
);

-- 10. تطبيق نفس المنطق على جدول maintenance_requests
DROP POLICY IF EXISTS "Users can view their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can create their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can update their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can delete their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Managers can view all maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Allow SELECT on maintenance_requests based on permissions"
ON public.maintenance_requests FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'maintenance', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
);

CREATE POLICY "Allow INSERT on maintenance_requests based on permissions"
ON public.maintenance_requests FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'maintenance', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
);

CREATE POLICY "Allow UPDATE on maintenance_requests based on permissions"
ON public.maintenance_requests FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'maintenance', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
);

CREATE POLICY "Allow DELETE on maintenance_requests based on permissions"
ON public.maintenance_requests FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'maintenance', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'maintenance'))
);

-- 11. تطبيق نفس المنطق على جدول suppliers
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can create their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Managers can view all suppliers" ON public.suppliers;

CREATE POLICY "Allow SELECT on suppliers based on permissions"
ON public.suppliers FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'suppliers', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
);

CREATE POLICY "Allow INSERT on suppliers based on permissions"
ON public.suppliers FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'suppliers', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
);

CREATE POLICY "Allow UPDATE on suppliers based on permissions"
ON public.suppliers FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'suppliers', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
);

CREATE POLICY "Allow DELETE on suppliers based on permissions"
ON public.suppliers FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'suppliers', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'suppliers'))
);

-- 12. تطبيق نفس المنطق على جدول invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Managers can view all invoices" ON public.invoices;

CREATE POLICY "Allow SELECT on invoices based on permissions"
ON public.invoices FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'invoices', 'view')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
);

CREATE POLICY "Allow INSERT on invoices based on permissions"
ON public.invoices FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'invoices', 'create')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
);

CREATE POLICY "Allow UPDATE on invoices based on permissions"
ON public.invoices FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'invoices', 'edit')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
);

CREATE POLICY "Allow DELETE on invoices based on permissions"
ON public.invoices FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'invoices', 'delete')
  OR (public.is_manager_or_admin() AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND page_name = 'invoices'))
);
