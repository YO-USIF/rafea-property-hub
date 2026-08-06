-- assignment_orders: tie writes to ownership for non-managers
DROP POLICY IF EXISTS "Allow INSERT on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow INSERT on assignment_orders based on permissions"
ON public.assignment_orders FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (is_admin() OR check_user_permission(auth.uid(), 'assignment_orders', 'create'))
);

DROP POLICY IF EXISTS "Allow UPDATE on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow UPDATE on assignment_orders based on permissions"
ON public.assignment_orders FOR UPDATE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'assignment_orders', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
)
WITH CHECK (
  (is_admin() OR check_user_permission(auth.uid(), 'assignment_orders', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow DELETE on assignment_orders based on permissions" ON public.assignment_orders;
CREATE POLICY "Allow DELETE on assignment_orders based on permissions"
ON public.assignment_orders FOR DELETE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'assignment_orders', 'delete'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

-- hoa_members: owner scoping for non-managers
DROP POLICY IF EXISTS "Allow SELECT on hoa_members based on permissions" ON public.hoa_members;
CREATE POLICY "Allow SELECT on hoa_members based on permissions"
ON public.hoa_members FOR SELECT TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'view'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow INSERT on hoa_members based on permissions" ON public.hoa_members;
CREATE POLICY "Allow INSERT on hoa_members based on permissions"
ON public.hoa_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'create'))
);

DROP POLICY IF EXISTS "Allow UPDATE on hoa_members based on permissions" ON public.hoa_members;
CREATE POLICY "Allow UPDATE on hoa_members based on permissions"
ON public.hoa_members FOR UPDATE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
)
WITH CHECK (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow DELETE on hoa_members based on permissions" ON public.hoa_members;
CREATE POLICY "Allow DELETE on hoa_members based on permissions"
ON public.hoa_members FOR DELETE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'delete'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

-- hoa_fees: owner scoping for non-managers
DROP POLICY IF EXISTS "Allow SELECT on hoa_fees based on permissions" ON public.hoa_fees;
CREATE POLICY "Allow SELECT on hoa_fees based on permissions"
ON public.hoa_fees FOR SELECT TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'view'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow INSERT on hoa_fees based on permissions" ON public.hoa_fees;
CREATE POLICY "Allow INSERT on hoa_fees based on permissions"
ON public.hoa_fees FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'create'))
);

DROP POLICY IF EXISTS "Allow UPDATE on hoa_fees based on permissions" ON public.hoa_fees;
CREATE POLICY "Allow UPDATE on hoa_fees based on permissions"
ON public.hoa_fees FOR UPDATE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
)
WITH CHECK (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow DELETE on hoa_fees based on permissions" ON public.hoa_fees;
CREATE POLICY "Allow DELETE on hoa_fees based on permissions"
ON public.hoa_fees FOR DELETE TO authenticated
USING (
  (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'delete'))
  AND (is_manager_or_admin() OR user_id = auth.uid())
);

-- purchases: owner fallback consistent with purchase_items
DROP POLICY IF EXISTS "Allow SELECT on purchases based on permissions" ON public.purchases;
CREATE POLICY "Allow SELECT on purchases based on permissions"
ON public.purchases FOR SELECT TO authenticated
USING (
  is_admin()
  OR check_user_permission(auth.uid(), 'purchases', 'view')
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Allow UPDATE on purchases based on permissions" ON public.purchases;
CREATE POLICY "Allow UPDATE on purchases based on permissions"
ON public.purchases FOR UPDATE TO authenticated
USING (
  is_admin()
  OR check_user_permission(auth.uid(), 'purchases', 'edit')
  OR user_id = auth.uid()
)
WITH CHECK (
  is_admin()
  OR check_user_permission(auth.uid(), 'purchases', 'edit')
  OR user_id = auth.uid()
);