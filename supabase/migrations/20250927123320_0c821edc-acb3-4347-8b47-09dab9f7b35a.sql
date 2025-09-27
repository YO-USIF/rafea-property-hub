-- Add customer_id_number field to sales table
ALTER TABLE public.sales 
ADD COLUMN customer_id_number text;