
-- ============================================
-- Fix 1: user_roles - restrict policies to authenticated role
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin users can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================
-- Fix 2: customers - restrict to authenticated and add explicit DELETE policy
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view customers in their own sales" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers in their sales" ON public.customers;

CREATE POLICY "Authenticated users can create customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view customers in their own sales"
ON public.customers
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  ))
  OR public.is_manager_or_admin()
);

CREATE POLICY "Users can update customers in their sales"
ON public.customers
FOR UPDATE
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  ))
  OR public.is_manager_or_admin()
)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  ))
  OR public.is_manager_or_admin()
);

CREATE POLICY "Admins can delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (public.is_admin());
