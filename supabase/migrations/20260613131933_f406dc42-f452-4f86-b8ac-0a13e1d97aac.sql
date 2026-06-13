ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_purchase_id ON public.invoices(purchase_id);