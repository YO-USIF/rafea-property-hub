ALTER TABLE public.invoices ALTER COLUMN due_date DROP NOT NULL;
ALTER TABLE public.purchases ALTER COLUMN expected_delivery DROP NOT NULL;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS purchase_officer text;