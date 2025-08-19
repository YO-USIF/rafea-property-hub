-- Create function to check if user can access customer personal data
CREATE OR REPLACE FUNCTION public.can_access_customer_data()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only system admins can access all customer personal data
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير النظام'
  );
END;
$$;

-- Create a secure view for sales that masks customer personal data
CREATE OR REPLACE VIEW public.sales_secure AS
SELECT 
  id,
  user_id,
  project_name,
  unit_number,
  unit_type,
  area,
  price,
  sale_date,
  remaining_amount,
  status,
  installment_plan,
  created_at,
  updated_at,
  -- Mask customer personal information for non-authorized users
  CASE 
    WHEN (auth.uid() = user_id) OR can_access_customer_data() THEN customer_name
    ELSE '*** محجوب ***'
  END AS customer_name,
  CASE 
    WHEN (auth.uid() = user_id) OR can_access_customer_data() THEN customer_phone
    ELSE '*** محجوب ***'
  END AS customer_phone
FROM public.sales;

-- Enable RLS on the view
ALTER VIEW public.sales_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view sales with appropriate data masking"
ON public.sales_secure
FOR SELECT
USING (
  (auth.uid() = user_id) OR is_manager_or_admin()
);

-- Update the original sales table RLS policy to be more restrictive for SELECT
DROP POLICY IF EXISTS "Users can view authorized sales data" ON public.sales;

CREATE POLICY "Users can view their own sales or admins can view all"
ON public.sales
FOR SELECT
USING (
  (auth.uid() = user_id) OR can_access_customer_data()
);