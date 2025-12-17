-- إضافة سياسة للسماح للمدراء ومدير النظام برفع الملفات
CREATE POLICY "Admins and managers can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  is_manager_or_admin()
);

-- إضافة سياسة للسماح للمدراء بتعديل الملفات
CREATE POLICY "Managers can update all documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  is_manager_or_admin()
);

-- إضافة سياسة للسماح للمدراء بحذف الملفات
CREATE POLICY "Managers can delete all documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  is_manager_or_admin()
);