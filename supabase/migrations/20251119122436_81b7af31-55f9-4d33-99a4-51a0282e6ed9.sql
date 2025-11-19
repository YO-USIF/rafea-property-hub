-- Create customers table with strict access controls
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_id_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Only system admins can view customer PII
CREATE POLICY "Only admins can view customer data"
ON public.customers
FOR SELECT
USING (can_access_customer_data());

-- Only system admins can insert customer data
CREATE POLICY "Only admins can create customers"
ON public.customers
FOR INSERT
WITH CHECK (can_access_customer_data());

-- Only system admins can update customer data
CREATE POLICY "Only admins can update customers"
ON public.customers
FOR UPDATE
USING (can_access_customer_data());

-- Add customer_id to sales table
ALTER TABLE public.sales ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Migrate existing customer data to customers table
INSERT INTO public.customers (id, customer_name, customer_phone, customer_id_number, created_by)
SELECT 
  gen_random_uuid(),
  customer_name,
  customer_phone,
  customer_id_number,
  user_id
FROM public.sales
WHERE customer_name IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update sales table with customer_id references
UPDATE public.sales s
SET customer_id = c.id
FROM public.customers c
WHERE s.customer_name = c.customer_name 
  AND COALESCE(s.customer_phone, '') = COALESCE(c.customer_phone, '')
  AND s.user_id = c.created_by;

-- Create index for better performance
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX idx_customers_created_by ON public.customers(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging table for customer data access
CREATE TABLE public.customer_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  action TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.customer_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view access logs"
ON public.customer_access_logs
FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert access logs"
ON public.customer_access_logs
FOR INSERT
WITH CHECK (true);

-- Create function to log customer data access
CREATE OR REPLACE FUNCTION log_customer_access(
  _customer_id UUID,
  _action TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.customer_access_logs (user_id, customer_id, action)
  VALUES (auth.uid(), _customer_id, _action);
END;
$$;