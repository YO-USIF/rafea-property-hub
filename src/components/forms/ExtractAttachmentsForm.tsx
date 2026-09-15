import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { useExtracts } from '@/hooks/useExtracts';

interface ExtractAttachmentsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extract: any;
}

const ExtractAttachmentsForm = ({ open, onOpenChange, extract }: ExtractAttachmentsFormProps) => {
  const { updateExtract } = useExtracts();
  const [loading, setLoading] = useState(false);
  const [file1, setFile1] = useState({ url: '', name: '' });
  const [file2, setFile2] = useState({ url: '', name: '' });

  useEffect(() => {
    if (extract) {
      setFile1({ url: extract.attached_file_url || '', name: extract.attached_file_name || '' });
      setFile2({ url: extract.attached_file_url_2 || '', name: extract.attached_file_name_2 || '' });
    }
  }, [extract]);

  const handleSave = async () => {
    if (!extract) return;
    setLoading(true);
    try {
      await updateExtract.mutateAsync({
        id: extract.id,
        attached_file_url: file1.url || null,
        attached_file_name: file1.name || null,
        attached_file_url_2: file2.url || null,
        attached_file_name_2: file2.name || null,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>مرفقات المستخلص</DialogTitle>
          <DialogDescription>
            إضافة أو تحديث مرفقات المستخلص رقم {extract?.extract_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>المرفق الأول</Label>
            <FileUpload
              currentFileUrl={file1.url}
              currentFileName={file1.name}
              onFileUploaded={(url, name) => setFile1({ url, name })}
              onFileRemoved={() => setFile1({ url: '', name: '' })}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              maxSizeMB={10}
            />
          </div>

          <div className="space-y-2">
            <Label>المرفق الثاني</Label>
            <FileUpload
              currentFileUrl={file2.url}
              currentFileName={file2.name}
              onFileUploaded={(url, name) => setFile2({ url, name })}
              onFileRemoved={() => setFile2({ url: '', name: '' })}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              maxSizeMB={10}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ المرفقات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractAttachmentsForm;
