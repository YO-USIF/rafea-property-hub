import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useFileHandler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<{ url: string; fileName: string } | null> => {
    if (!user?.id) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      // إنشاء URL موقع بدلاً من signed URL لتجنب انتهاء الصلاحية
      return {
        url: `storage/documents/${filePath}`, // مسار نسبي
        fileName: file.name
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({ 
        title: "خطأ في رفع الملف", 
        description: error.message, 
        variant: "destructive" 
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [user?.id, toast]);

  const downloadFile = useCallback(async (filePath: string, fileName: string) => {
    if (!user?.id) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    try {
      // استخراج المسار الحقيقي للملف
      const actualPath = filePath.replace('storage/documents/', '');
      
      // إنشاء signed URL جديد للتحميل
      const { data: signedUrlData, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(actualPath, 3600);

      if (error) throw error;

      // تحميل الملف
      const response = await fetch(signedUrlData.signedUrl);
      if (!response.ok) throw new Error('فشل في تحميل الملف');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "تم تحميل الملف بنجاح" });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({ 
        title: "خطأ في تحميل الملف", 
        description: error.message || "تعذر تحميل الملف",
        variant: "destructive" 
      });
    }
  }, [user?.id, toast]);

  const viewFile = useCallback(async (filePath: string) => {
    if (!user?.id) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return null;
    }

    try {
      const actualPath = filePath.replace('storage/documents/', '');
      
      const { data: signedUrlData, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(actualPath, 3600);

      if (error) throw error;

      // فتح الملف في نافذة جديدة
      window.open(signedUrlData.signedUrl, '_blank');
      return signedUrlData.signedUrl;
    } catch (error: any) {
      console.error('View file error:', error);
      toast({ 
        title: "خطأ في عرض الملف", 
        description: error.message || "تعذر عرض الملف",
        variant: "destructive" 
      });
      return null;
    }
  }, [user?.id, toast]);

  const deleteFile = useCallback(async (filePath: string) => {
    if (!user?.id) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return false;
    }

    try {
      const actualPath = filePath.replace('storage/documents/', '');
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([actualPath]);

      if (error) throw error;

      toast({ title: "تم حذف الملف بنجاح" });
      return true;
    } catch (error: any) {
      console.error('Delete file error:', error);
      toast({ 
        title: "خطأ في حذف الملف", 
        description: error.message || "تعذر حذف الملف",
        variant: "destructive" 
      });
      return false;
    }
  }, [user?.id, toast]);

  return {
    uploadFile,
    downloadFile,
    viewFile,
    deleteFile,
    uploading
  };
};