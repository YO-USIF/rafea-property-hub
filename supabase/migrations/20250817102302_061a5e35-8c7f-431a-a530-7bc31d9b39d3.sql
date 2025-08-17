-- Fix critical security vulnerability: Restrict access to customer data in sales table
-- Replace overly permissive policy with proper role-based access control

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "All users can view all sales" ON sales;

-- Create secure policy that protects customer personal information
-- Only allow users to see their own sales data OR if they're managers/admins
CREATE POLICY "Users can view authorized sales data" 
ON sales 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_manager_or_admin()
);

-- Ensure the existing creation, update, and delete policies remain secure
-- These should already be properly restricted, but let's verify

-- Users can only create sales with their own user_id
CREATE POLICY "Users can create their own sales" 
ON sales 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own sales (unless manager/admin)
CREATE POLICY "Users can update authorized sales" 
ON sales 
FOR UPDATE 
USING (auth.uid() = user_id OR is_manager_or_admin());

-- Users can only delete their own sales (unless manager/admin)  
CREATE POLICY "Users can delete authorized sales"
ON sales 
FOR DELETE 
USING (auth.uid() = user_id OR is_manager_or_admin());