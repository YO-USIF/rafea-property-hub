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

-- Update existing policies to use proper naming and ensure security
-- (Only create if they don't already exist with exact names)

-- For UPDATE operations
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
CREATE POLICY "Users can update authorized sales" 
ON sales 
FOR UPDATE 
USING (auth.uid() = user_id OR is_manager_or_admin());

-- For DELETE operations  
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
CREATE POLICY "Users can delete authorized sales"
ON sales 
FOR DELETE 
USING (auth.uid() = user_id OR is_manager_or_admin());