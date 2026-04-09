
-- Drop the old admin-only insert policy
DROP POLICY IF EXISTS "Admins can create task reports" ON public.task_reports;

-- Create new policy allowing all authenticated users to insert their own reports
CREATE POLICY "Authenticated users can create task reports"
ON public.task_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
