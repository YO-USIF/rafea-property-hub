-- إنشاء bucket للوثائق إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- حذف الصلاحيات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Managers can view all documents" ON storage.objects;

-- إنشاء صلاحيات للمستخدمين المصادق عليهم لعرض الملفات الخاصة بهم
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لرفع ملفاتهم الخاصة
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لتحديث ملفاتهم الخاصة
CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمستخدمين لحذف ملفاتهم الخاصة
CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- إنشاء صلاحية للمدراء لعرض جميع الملفات
CREATE POLICY "Managers can view all documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND is_manager_or_admin());