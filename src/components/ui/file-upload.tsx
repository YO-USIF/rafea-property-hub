import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  currentFileUrl?: string;
  currentFileName?: string;
  onFileRemoved?: () => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  currentFileUrl,
  currentFileName,
  onFileRemoved,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx',
  maxSizeMB = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!user?.id) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ 
        title: "ملف كبير جداً", 
        description: `حجم الملف يجب أن يكون أقل من ${maxSizeMB}MB`, 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      // إنشاء مسار فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // رفع الملف
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      // الحصول على URL الملف
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (onFileUploaded) {
        onFileUploaded(urlData.publicUrl, file.name);
      }

      toast({ title: "تم رفع الملف بنجاح" });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({ 
        title: "خطأ في رفع الملف", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const downloadFile = async () => {
    if (currentFileUrl) {
      try {
        const response = await fetch(currentFileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName || 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        toast({ 
          title: "خطأ في تحميل الملف", 
          variant: "destructive" 
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label>الملف المرفق</Label>
      
      {currentFileUrl && currentFileName ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
          <File className="w-5 h-5 text-blue-600" />
          <span className="flex-1 text-sm">{currentFileName}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadFile}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFileRemoved}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            اسحب وأفلت الملف هنا أو انقر للاختيار
          </p>
          <p className="text-xs text-gray-500 mb-4">
            الملفات المدعومة: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (حد أقصى {maxSizeMB}MB)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'جارٍ الرفع...' : 'اختيار ملف'}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};