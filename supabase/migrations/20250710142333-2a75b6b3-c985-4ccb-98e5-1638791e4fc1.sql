-- تحديث policies المهام للسماح للمدير والمدير النظام بتحديث وحذف المهام

-- تحديث policy التحديث للمهام
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update tasks" 
ON tasks 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin()
);

-- تحديث policy الحذف للمهام
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete tasks" 
ON tasks 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  is_manager_or_admin()
);