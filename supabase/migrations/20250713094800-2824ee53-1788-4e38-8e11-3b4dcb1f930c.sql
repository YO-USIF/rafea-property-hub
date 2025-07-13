-- إضافة حقل project_id إلى جدول invoices
ALTER TABLE public.invoices ADD COLUMN project_id uuid REFERENCES public.projects(id);

-- إضافة حقل project_id إلى جدول purchases  
ALTER TABLE public.purchases ADD COLUMN project_id uuid REFERENCES public.projects(id);

-- إضافة فهرس للأداء
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_purchases_project_id ON public.purchases(project_id);