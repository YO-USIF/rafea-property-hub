
-- customers: gate INSERT behind sales:create permission
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
CREATE POLICY "Users can create customers with sales permission"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (
  (public.is_admin() OR public.check_user_permission(auth.uid(), 'sales', 'create'))
  AND auth.uid() = created_by
);

-- journal_entries: gate INSERT behind accounting:create permission
DROP POLICY IF EXISTS "Users can create journal entries" ON public.journal_entries;
CREATE POLICY "Users can create journal entries with accounting permission"
ON public.journal_entries FOR INSERT TO authenticated
WITH CHECK (
  (public.is_admin() OR public.check_user_permission(auth.uid(), 'accounting', 'create'))
  AND auth.uid() = created_by
);

-- purchase_items: mirror purchases permission model on all CRUD
DROP POLICY IF EXISTS "Users can view purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can create purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can update purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can delete purchase items" ON public.purchase_items;

CREATE POLICY "View purchase items based on permissions"
ON public.purchase_items FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'view')
  OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_items.purchase_id AND p.user_id = auth.uid())
);

CREATE POLICY "Create purchase items based on permissions"
ON public.purchase_items FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'create')
  OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_items.purchase_id AND p.user_id = auth.uid())
);

CREATE POLICY "Update purchase items based on permissions"
ON public.purchase_items FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'edit')
  OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_items.purchase_id AND p.user_id = auth.uid())
);

CREATE POLICY "Delete purchase items based on permissions"
ON public.purchase_items FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'purchases', 'delete')
  OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_items.purchase_id AND p.user_id = auth.uid())
);

-- task_reports: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view task reports" ON public.task_reports;
CREATE POLICY "View task reports based on permissions"
ON public.task_reports FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR public.check_user_permission(auth.uid(), 'tasks', 'view')
  OR created_by = auth.uid()
);

-- warehouse_inventory: remove legacy owner-based dual policies
DROP POLICY IF EXISTS "Users can view warehouse inventory" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can create inventory items" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can update inventory items" ON public.warehouse_inventory;
DROP POLICY IF EXISTS "Users can delete inventory items" ON public.warehouse_inventory;

-- warehouse_transactions: remove legacy owner-based dual policies
DROP POLICY IF EXISTS "Users can view warehouse transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can create warehouse transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can update warehouse transactions" ON public.warehouse_transactions;
DROP POLICY IF EXISTS "Users can delete warehouse transactions" ON public.warehouse_transactions;
