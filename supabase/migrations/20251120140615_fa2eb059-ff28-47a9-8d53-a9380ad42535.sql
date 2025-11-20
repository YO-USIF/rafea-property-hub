-- إضافة حقل طريقة السداد وملف مرفق لجدول المبيعات
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS attached_file_url text,
ADD COLUMN IF NOT EXISTS attached_file_name text;