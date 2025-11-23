-- إضافة حقل أمر التكليف إلى جدول المستخلصات
ALTER TABLE public.extracts
ADD COLUMN IF NOT EXISTS assignment_order TEXT,
ADD COLUMN IF NOT EXISTS is_external_project BOOLEAN DEFAULT false;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN public.extracts.assignment_order IS 'رقم أمر التكليف المرتبط بالمستخلص';
COMMENT ON COLUMN public.extracts.is_external_project IS 'هل المشروع خارجي (خارج البرنامج)';
