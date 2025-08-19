-- Remove the security definer view and create a regular view
DROP VIEW IF EXISTS public.sales_secure;

-- Create a regular view without security definer
CREATE VIEW public.sales_secure AS
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
FROM public.sales
WHERE (auth.uid() = user_id) OR is_manager_or_admin();