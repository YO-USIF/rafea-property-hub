-- Add marketer_name field to sales table
ALTER TABLE public.sales 
ADD COLUMN marketer_name text;