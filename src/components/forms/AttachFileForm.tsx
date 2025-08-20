import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';

interface AttachFileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  currentFileUrl?: string;
  currentFileName?: string;
  onSuccess: () => void;
}

const AttachFileForm = ({ 
  open, 
  onOpenChange, 
  taskId, 
  taskTitle, 
  currentFileUrl, 
  currentFileName,
  onSuccess 
}: AttachFileFormProps) => {
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(currentFileUrl || '');
  const [fileName, setFileName] = useState(currentFileName || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateTask.mutateAsync({ 
        id: taskId, 
        file_url: fileUrl,
        file_name: fileName
      });
      
      toast({
        title: "تم إرفاق الملف بنجاح",
        description: `تم إرفاق الملف للمهمة: ${taskTitle}`
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ في إرفاق الملف",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إرفاق ملف للمهمة</DialogTitle>
          <DialogDescription>
            إضافة ملف مرفق للمهمة: {taskTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileUploaded={(uploadedFileUrl, uploadedFileName) => {
              setFileUrl(uploadedFileUrl);
              setFileName(uploadedFileName);
            }}
            currentFileUrl={fileUrl}
            currentFileName={fileName}
            onFileRemoved={() => {
              setFileUrl('');
              setFileName('');
            }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.txt"
            maxSizeMB={5}
          />

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ المرفق'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttachFileForm;