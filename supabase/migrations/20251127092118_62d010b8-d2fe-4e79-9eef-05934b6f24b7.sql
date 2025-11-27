-- تحديث RLS policies لجعل المدراء يعتمدون على صفحة الصلاحيات فقط

-- حذف السياسات القديمة وإنشاء سياسات جديدة لجدول assignment_orders
DROP POLICY IF EXISTS "Allow SELECT on assignment_orders based on permissions" ON assignment_orders;
DROP POLICY IF EXISTS "Allow INSERT on assignment_orders based on permissions" ON assignment_orders;
DROP POLICY IF EXISTS "Allow UPDATE on assignment_orders based on permissions" ON assignment_orders;
DROP POLICY IF EXISTS "Allow DELETE on assignment_orders based on permissions" ON assignment_orders;

CREATE POLICY "Allow SELECT on assignment_orders based on permissions"
ON assignment_orders FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'assignment_orders', 'view')
);

CREATE POLICY "Allow INSERT on assignment_orders based on permissions"
ON assignment_orders FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'assignment_orders', 'create')
);

CREATE POLICY "Allow UPDATE on assignment_orders based on permissions"
ON assignment_orders FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'assignment_orders', 'edit')
);

CREATE POLICY "Allow DELETE on assignment_orders based on permissions"
ON assignment_orders FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'assignment_orders', 'delete')
);

-- تحديث سياسات جدول contractors
DROP POLICY IF EXISTS "Allow SELECT on contractors based on permissions" ON contractors;
DROP POLICY IF EXISTS "Allow INSERT on contractors based on permissions" ON contractors;
DROP POLICY IF EXISTS "Allow UPDATE on contractors based on permissions" ON contractors;
DROP POLICY IF EXISTS "Allow DELETE on contractors based on permissions" ON contractors;
DROP POLICY IF EXISTS "Users can view authorized contractor data" ON contractors;

CREATE POLICY "Allow SELECT on contractors based on permissions"
ON contractors FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'contractors', 'view')
);

CREATE POLICY "Allow INSERT on contractors based on permissions"
ON contractors FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'contractors', 'create')
);

CREATE POLICY "Allow UPDATE on contractors based on permissions"
ON contractors FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'contractors', 'edit')
);

CREATE POLICY "Allow DELETE on contractors based on permissions"
ON contractors FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'contractors', 'delete')
);

-- تحديث سياسات جدول extracts
DROP POLICY IF EXISTS "Allow SELECT on extracts based on permissions" ON extracts;
DROP POLICY IF EXISTS "Allow INSERT on extracts based on permissions" ON extracts;
DROP POLICY IF EXISTS "Allow UPDATE on extracts based on permissions" ON extracts;
DROP POLICY IF EXISTS "Allow DELETE on extracts based on permissions" ON extracts;
DROP POLICY IF EXISTS "Users can view authorized extract data" ON extracts;
DROP POLICY IF EXISTS "Users can update extracts" ON extracts;
DROP POLICY IF EXISTS "Users can delete extracts" ON extracts;

CREATE POLICY "Allow SELECT on extracts based on permissions"
ON extracts FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'extracts', 'view')
);

CREATE POLICY "Allow INSERT on extracts based on permissions"
ON extracts FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'extracts', 'create')
);

CREATE POLICY "Allow UPDATE on extracts based on permissions"
ON extracts FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'extracts', 'edit')
);

CREATE POLICY "Allow DELETE on extracts based on permissions"
ON extracts FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'extracts', 'delete')
);

-- تحديث سياسات جدول invoices
DROP POLICY IF EXISTS "Allow SELECT on invoices based on permissions" ON invoices;
DROP POLICY IF EXISTS "Allow INSERT on invoices based on permissions" ON invoices;
DROP POLICY IF EXISTS "Allow UPDATE on invoices based on permissions" ON invoices;
DROP POLICY IF EXISTS "Allow DELETE on invoices based on permissions" ON invoices;
DROP POLICY IF EXISTS "Users can view authorized invoice data" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

CREATE POLICY "Allow SELECT on invoices based on permissions"
ON invoices FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'invoices', 'view')
);

CREATE POLICY "Allow INSERT on invoices based on permissions"
ON invoices FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'invoices', 'create')
);

CREATE POLICY "Allow UPDATE on invoices based on permissions"
ON invoices FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'invoices', 'edit')
);

CREATE POLICY "Allow DELETE on invoices based on permissions"
ON invoices FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'invoices', 'delete')
);

-- تحديث سياسات جدول maintenance_requests
DROP POLICY IF EXISTS "Allow SELECT on maintenance_requests based on permissions" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow INSERT on maintenance_requests based on permissions" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow UPDATE on maintenance_requests based on permissions" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow DELETE on maintenance_requests based on permissions" ON maintenance_requests;
DROP POLICY IF EXISTS "Users can view authorized maintenance data" ON maintenance_requests;

CREATE POLICY "Allow SELECT on maintenance_requests based on permissions"
ON maintenance_requests FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'maintenance', 'view')
);

CREATE POLICY "Allow INSERT on maintenance_requests based on permissions"
ON maintenance_requests FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'maintenance', 'create')
);

CREATE POLICY "Allow UPDATE on maintenance_requests based on permissions"
ON maintenance_requests FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'maintenance', 'edit')
);

CREATE POLICY "Allow DELETE on maintenance_requests based on permissions"
ON maintenance_requests FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'maintenance', 'delete')
);

-- تحديث سياسات جدول projects
DROP POLICY IF EXISTS "Allow SELECT on projects based on permissions" ON projects;
DROP POLICY IF EXISTS "Allow INSERT on projects based on permissions" ON projects;
DROP POLICY IF EXISTS "Allow UPDATE on projects based on permissions" ON projects;
DROP POLICY IF EXISTS "Allow DELETE on projects based on permissions" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view project data" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

CREATE POLICY "Allow SELECT on projects based on permissions"
ON projects FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'projects', 'view')
);

CREATE POLICY "Allow INSERT on projects based on permissions"
ON projects FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'projects', 'create')
);

CREATE POLICY "Allow UPDATE on projects based on permissions"
ON projects FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'projects', 'edit')
);

CREATE POLICY "Allow DELETE on projects based on permissions"
ON projects FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'projects', 'delete')
);

-- تحديث سياسات جدول purchases
DROP POLICY IF EXISTS "Allow SELECT on purchases based on permissions" ON purchases;
DROP POLICY IF EXISTS "Allow INSERT on purchases based on permissions" ON purchases;
DROP POLICY IF EXISTS "Allow UPDATE on purchases based on permissions" ON purchases;
DROP POLICY IF EXISTS "Allow DELETE on purchases based on permissions" ON purchases;
DROP POLICY IF EXISTS "Users can view authorized purchase data" ON purchases;
DROP POLICY IF EXISTS "Users can update purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete purchases" ON purchases;

CREATE POLICY "Allow SELECT on purchases based on permissions"
ON purchases FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'purchases', 'view')
);

CREATE POLICY "Allow INSERT on purchases based on permissions"
ON purchases FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'purchases', 'create')
);

CREATE POLICY "Allow UPDATE on purchases based on permissions"
ON purchases FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'purchases', 'edit')
);

CREATE POLICY "Allow DELETE on purchases based on permissions"
ON purchases FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'purchases', 'delete')
);

-- تحديث سياسات جدول sales
DROP POLICY IF EXISTS "Allow SELECT based on permissions" ON sales;
DROP POLICY IF EXISTS "Allow INSERT based on permissions" ON sales;
DROP POLICY IF EXISTS "Allow UPDATE based on permissions" ON sales;
DROP POLICY IF EXISTS "Allow DELETE based on permissions" ON sales;

CREATE POLICY "Allow SELECT based on permissions"
ON sales FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'sales', 'view')
);

CREATE POLICY "Allow INSERT based on permissions"
ON sales FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'sales', 'create')
);

CREATE POLICY "Allow UPDATE based on permissions"
ON sales FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'sales', 'edit')
);

CREATE POLICY "Allow DELETE based on permissions"
ON sales FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'sales', 'delete')
);

-- تحديث سياسات جدول suppliers
DROP POLICY IF EXISTS "Allow SELECT on suppliers based on permissions" ON suppliers;
DROP POLICY IF EXISTS "Allow INSERT on suppliers based on permissions" ON suppliers;
DROP POLICY IF EXISTS "Allow UPDATE on suppliers based on permissions" ON suppliers;
DROP POLICY IF EXISTS "Allow DELETE on suppliers based on permissions" ON suppliers;

CREATE POLICY "Allow SELECT on suppliers based on permissions"
ON suppliers FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'suppliers', 'view')
);

CREATE POLICY "Allow INSERT on suppliers based on permissions"
ON suppliers FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'suppliers', 'create')
);

CREATE POLICY "Allow UPDATE on suppliers based on permissions"
ON suppliers FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'suppliers', 'edit')
);

CREATE POLICY "Allow DELETE on suppliers based on permissions"
ON suppliers FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'suppliers', 'delete')
);

-- تحديث سياسات جدول tasks
DROP POLICY IF EXISTS "Allow SELECT on tasks based on permissions" ON tasks;
DROP POLICY IF EXISTS "Allow INSERT on tasks based on permissions" ON tasks;
DROP POLICY IF EXISTS "Allow UPDATE on tasks based on permissions" ON tasks;
DROP POLICY IF EXISTS "Allow DELETE on tasks based on permissions" ON tasks;

CREATE POLICY "Allow SELECT on tasks based on permissions"
ON tasks FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'tasks', 'view')
);

CREATE POLICY "Allow INSERT on tasks based on permissions"
ON tasks FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'tasks', 'create')
);

CREATE POLICY "Allow UPDATE on tasks based on permissions"
ON tasks FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'tasks', 'edit')
);

CREATE POLICY "Allow DELETE on tasks based on permissions"
ON tasks FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'tasks', 'delete')
);

-- تحديث سياسات جدول warehouse_inventory
DROP POLICY IF EXISTS "Allow SELECT on warehouse_inventory based on permissions" ON warehouse_inventory;
DROP POLICY IF EXISTS "Allow INSERT on warehouse_inventory based on permissions" ON warehouse_inventory;
DROP POLICY IF EXISTS "Allow UPDATE on warehouse_inventory based on permissions" ON warehouse_inventory;
DROP POLICY IF EXISTS "Allow DELETE on warehouse_inventory based on permissions" ON warehouse_inventory;

CREATE POLICY "Allow SELECT on warehouse_inventory based on permissions"
ON warehouse_inventory FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'view')
);

CREATE POLICY "Allow INSERT on warehouse_inventory based on permissions"
ON warehouse_inventory FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'create')
);

CREATE POLICY "Allow UPDATE on warehouse_inventory based on permissions"
ON warehouse_inventory FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'edit')
);

CREATE POLICY "Allow DELETE on warehouse_inventory based on permissions"
ON warehouse_inventory FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'delete')
);

-- تحديث سياسات جدول warehouse_transactions
DROP POLICY IF EXISTS "Allow SELECT on warehouse_transactions based on permissions" ON warehouse_transactions;
DROP POLICY IF EXISTS "Allow INSERT on warehouse_transactions based on permissions" ON warehouse_transactions;
DROP POLICY IF EXISTS "Allow UPDATE on warehouse_transactions based on permissions" ON warehouse_transactions;
DROP POLICY IF EXISTS "Allow DELETE on warehouse_transactions based on permissions" ON warehouse_transactions;

CREATE POLICY "Allow SELECT on warehouse_transactions based on permissions"
ON warehouse_transactions FOR SELECT
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'view')
);

CREATE POLICY "Allow INSERT on warehouse_transactions based on permissions"
ON warehouse_transactions FOR INSERT
WITH CHECK (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'create')
);

CREATE POLICY "Allow UPDATE on warehouse_transactions based on permissions"
ON warehouse_transactions FOR UPDATE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'edit')
);

CREATE POLICY "Allow DELETE on warehouse_transactions based on permissions"
ON warehouse_transactions FOR DELETE
USING (
  is_admin() OR 
  check_user_permission(auth.uid(), 'warehouse', 'delete')
);