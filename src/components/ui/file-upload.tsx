import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Download, Eye } from 'lucide-react';
import { useFileHandler } from '@/hooks/useFileHandler';

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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, downloadFile, viewFile, uploading } = useFileHandler();

  const handleFileUpload = async (file: File) => {
    // التحقق من حجم الملف
    if (file.size > maxSizeMB * 1024 * 1024) {
      return;
    }

    const result = await uploadFile(file);
    if (result && onFileUploaded) {
      onFileUploaded(result.url, result.fileName);
    }
  };

  const handleFileSelect = (file: File) => {
    handleFileUpload(file);
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

  const handleDownload = () => {
    if (currentFileUrl && currentFileName) {
      downloadFile(currentFileUrl, currentFileName);
    }
  };

  const handleView = () => {
    if (currentFileUrl) {
      viewFile(currentFileUrl);
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
            onClick={handleView}
            title="عرض الملف"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="تحميل الملف"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFileRemoved}
            title="إزالة الملف"
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