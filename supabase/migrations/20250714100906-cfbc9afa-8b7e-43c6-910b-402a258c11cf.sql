-- إنشاء bucket للوثائق إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- إنشاء صلاحيات للمستخدمين المصادق عليهم لعرض الملفات الخاصة بهم
CREATE POLICY IF NOT EXISTS "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لرفع ملفاتهم الخاصة
CREATE POLICY IF NOT EXISTS "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لتحديث ملفاتهم الخاصة
CREATE POLICY IF NOT EXISTS "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لحذف ملفاتهم الخاصة
CREATE POLICY IF NOT EXISTS "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمدراء لعرض جميع الملفات
CREATE POLICY IF NOT EXISTS "Managers can view all documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND is_manager_or_admin());