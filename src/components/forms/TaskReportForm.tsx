import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTaskReports } from '@/hooks/useTaskReports';

interface TaskReport {
  id?: string;
  title: string;
  content: string;
}

interface TaskReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: TaskReport;
  onSuccess: () => void;
}

const TaskReportForm = ({ open, onOpenChange, report, onSuccess }: TaskReportFormProps) => {
  const { createReport, updateReport } = useTaskReports();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskReport>({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        content: report.content || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
      });
    }
  }, [report]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (report?.id) {
        await updateReport.mutateAsync({ id: report.id, ...formData });
      } else {
        await createReport.mutateAsync(formData);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {report ? 'تعديل التقرير' : 'إضافة تقرير جديد'}
          </DialogTitle>
          <DialogDescription>
            {report ? 'قم بتعديل بيانات التقرير' : 'أدخل بيانات التقرير الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان التقرير</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="مثال: تقرير أسبوعي للمهام"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">محتوى التقرير</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="اكتب محتوى التقرير هنا..."
              rows={10}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (report ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReportForm;