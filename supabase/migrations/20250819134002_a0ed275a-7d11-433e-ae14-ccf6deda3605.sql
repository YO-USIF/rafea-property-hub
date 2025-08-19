-- إضافة حقول الملف المرفق لجدول المهام
ALTER TABLE public.tasks ADD COLUMN file_url TEXT;
ALTER TABLE public.tasks ADD COLUMN file_name TEXT;