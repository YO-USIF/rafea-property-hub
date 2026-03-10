
ALTER TABLE public.extracts 
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'كامل',
ADD COLUMN IF NOT EXISTS installments_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS installment_amount numeric DEFAULT 0;
