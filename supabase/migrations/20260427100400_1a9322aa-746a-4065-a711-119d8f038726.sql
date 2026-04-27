
-- SUPPLIERS
DROP POLICY IF EXISTS "Users can view authorized supplier data" ON public.suppliers;

-- TASKS
DROP POLICY IF EXISTS "Users can view authorized task data" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON public.tasks;

-- CUSTOMERS
DROP POLICY IF EXISTS "Users can view customers in their own sales" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers in their sales" ON public.customers;

CREATE POLICY "Users can view customers in their own sales"
ON public.customers
FOR SELECT
TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update customers in their sales"
ON public.customers
FOR UPDATE
TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  )
)
WITH CHECK (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.customer_id = customers.id AND sales.user_id = auth.uid()
  )
);

-- TASK_REPORTS
DROP POLICY IF EXISTS "Admins can update task reports" ON public.task_reports;
DROP POLICY IF EXISTS "Admins can delete task reports" ON public.task_reports;

CREATE POLICY "Update task reports based on permissions"
ON public.task_reports
FOR UPDATE
TO authenticated
USING (is_admin() OR check_user_permission(auth.uid(), 'tasks', 'edit'));

CREATE POLICY "Delete task reports based on permissions"
ON public.task_reports
FOR DELETE
TO authenticated
USING (is_admin() OR check_user_permission(auth.uid(), 'tasks', 'delete'));

-- JOURNAL_ENTRIES
DROP POLICY IF EXISTS "Users can view journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Admin users can update journal entries" ON public.journal_entries;

CREATE POLICY "View journal entries based on permissions"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (
  is_admin()
  OR check_user_permission(auth.uid(), 'accounting', 'view')
  OR created_by = auth.uid()
);

CREATE POLICY "Update journal entries based on permissions"
ON public.journal_entries
FOR UPDATE
TO authenticated
USING (
  is_admin()
  OR (check_user_permission(auth.uid(), 'accounting', 'edit') AND created_by = auth.uid())
);

-- JOURNAL_ENTRY_LINES
DROP POLICY IF EXISTS "Users can view journal entry lines" ON public.journal_entry_lines;

CREATE POLICY "View journal entry lines based on permissions"
ON public.journal_entry_lines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.journal_entries je
    WHERE je.id = journal_entry_lines.journal_entry_id
    AND (
      is_admin()
      OR check_user_permission(auth.uid(), 'accounting', 'view')
      OR je.created_by = auth.uid()
    )
  )
);

-- FINANCIAL_REPORTS
DROP POLICY IF EXISTS "Users can view financial reports" ON public.financial_reports;

CREATE POLICY "View financial reports based on permissions"
ON public.financial_reports
FOR SELECT
TO authenticated
USING (
  is_admin()
  OR check_user_permission(auth.uid(), 'reports', 'view')
  OR created_by = auth.uid()
);
