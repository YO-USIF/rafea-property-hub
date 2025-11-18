-- إضافة حقول الضريبة لجدول المستخلصات
ALTER TABLE public.extracts 
ADD COLUMN IF NOT EXISTS tax_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_before_tax numeric DEFAULT 0;

COMMENT ON COLUMN public.extracts.tax_included IS 'هل المبلغ شامل الضريبة 15%';
COMMENT ON COLUMN public.extracts.tax_amount IS 'قيمة الضريبة المضافة';
COMMENT ON COLUMN public.extracts.amount_before_tax IS 'المبلغ قبل الضريبة';