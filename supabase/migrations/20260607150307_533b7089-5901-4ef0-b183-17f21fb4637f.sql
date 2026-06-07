-- 1. Harden check_user_permission: prevent probing other users' permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(_user_id uuid, _page_name text, _permission_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_permission BOOLEAN;
BEGIN
  -- Only allow callers to check their own permissions (admins may check anyone)
  IF _user_id IS DISTINCT FROM auth.uid() AND NOT is_admin() THEN
    RETURN false;
  END IF;

  -- System admin has all permissions
  IF is_admin() THEN
    RETURN true;
  END IF;

  SELECT
    CASE
      WHEN _permission_type = 'view' THEN can_view
      WHEN _permission_type = 'create' THEN can_create
      WHEN _permission_type = 'edit' THEN can_edit
      WHEN _permission_type = 'delete' THEN can_delete
      ELSE false
    END INTO has_permission
  FROM public.user_permissions
  WHERE user_id = _user_id AND page_name = _page_name;

  IF has_permission IS NULL THEN
    RETURN false;
  END IF;

  RETURN COALESCE(has_permission, false);
END;
$function$;

-- 2. financial_reports: add UPDATE and DELETE policies
CREATE POLICY "Update financial reports based on permissions"
ON public.financial_reports FOR UPDATE TO authenticated
USING (is_admin() OR check_user_permission(auth.uid(), 'reports', 'edit') OR (created_by = auth.uid()))
WITH CHECK (is_admin() OR check_user_permission(auth.uid(), 'reports', 'edit') OR (created_by = auth.uid()));

CREATE POLICY "Delete financial reports based on permissions"
ON public.financial_reports FOR DELETE TO authenticated
USING (is_admin() OR check_user_permission(auth.uid(), 'reports', 'delete') OR (created_by = auth.uid()));

-- 3. journal_entries: add DELETE policy
CREATE POLICY "Delete journal entries based on permissions"
ON public.journal_entries FOR DELETE TO authenticated
USING (is_admin() OR (check_user_permission(auth.uid(), 'accounting', 'delete') AND (created_by = auth.uid())));

-- 4. purchase_items: scope policies to authenticated role explicitly
DROP POLICY IF EXISTS "Users can view purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can create purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can update purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Users can delete purchase items" ON public.purchase_items;

CREATE POLICY "Users can view purchase items"
ON public.purchase_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid()));

CREATE POLICY "Users can create purchase items"
ON public.purchase_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid()));

CREATE POLICY "Users can update purchase items"
ON public.purchase_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid()));

CREATE POLICY "Users can delete purchase items"
ON public.purchase_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM purchases WHERE purchases.id = purchase_items.purchase_id AND purchases.user_id = auth.uid()));

-- 5. task_reports: scope SELECT policy to authenticated role
DROP POLICY IF EXISTS "Authenticated users can view task reports" ON public.task_reports;
CREATE POLICY "Authenticated users can view task reports"
ON public.task_reports FOR SELECT TO authenticated
USING (true);