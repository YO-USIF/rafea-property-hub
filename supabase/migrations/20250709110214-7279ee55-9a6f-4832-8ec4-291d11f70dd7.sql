-- Update delete policy for projects to allow managers and admins
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can delete projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id OR is_manager_or_admin());