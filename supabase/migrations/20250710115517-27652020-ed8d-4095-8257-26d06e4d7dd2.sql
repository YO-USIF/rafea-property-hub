-- إنشاء storage bucket للملفات
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- إضافة policies للـ bucket
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إضافة حقل الملف المرفق للفواتير
ALTER TABLE invoices ADD COLUMN attached_file_url TEXT;
ALTER TABLE invoices ADD COLUMN attached_file_name TEXT;

-- إضافة حقل الملف المرفق لطلبات الشراء
ALTER TABLE purchases ADD COLUMN attached_file_url TEXT;
ALTER TABLE purchases ADD COLUMN attached_file_name TEXT;

-- إنشاء جدول المستخصات (extracts) مع إمكانية إرفاق الملفات
CREATE TABLE public.extracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  extract_number TEXT NOT NULL,
  extract_date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_name TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  percentage_completed NUMERIC DEFAULT 0,
  previous_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  attached_file_url TEXT,
  attached_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'قيد المراجعة',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS للمستخصات
ALTER TABLE public.extracts ENABLE ROW LEVEL SECURITY;

-- إنشاء policies للمستخصات
CREATE POLICY "Users can create their own extracts" 
ON public.extracts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extracts" 
ON public.extracts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extracts" 
ON public.extracts 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view extracts" 
ON public.extracts 
FOR SELECT 
USING ((auth.uid() = user_id) OR is_admin() OR ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'مدير'::user_role)))) AND (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = extracts.user_id) AND (user_roles.role = ANY (ARRAY['مدير'::user_role, 'موظف مبيعات'::user_role, 'محاسب'::user_role, 'موظف'::user_role])))))));

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_extracts_updated_at
BEFORE UPDATE ON public.extracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();