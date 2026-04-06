import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTaskReports } from '@/hooks/useTaskReports';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';

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

const statusOptions = [
  { value: 'جديدة', label: 'جديدة', icon: Clock, color: 'text-yellow-600' },
  { value: 'قيد التنفيذ', label: 'قيد التنفيذ', icon: Loader2, color: 'text-blue-600' },
  { value: 'مكتملة', label: 'مكتملة', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'متأخرة', label: 'متأخرة', icon: AlertTriangle, color: 'text-red-600' },
];

const TaskReportForm = ({ open, onOpenChange, report, onSuccess }: TaskReportFormProps) => {
  const { createReport, updateReport } = useTaskReports();
  const { isAdmin, isManager } = useUserRole();
  const { tasks, updateTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskReport>({
    title: '',
    content: '',
  });

  // Progress fields for sub-users only
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('جديدة');

  const isManagerOrAdmin = isAdmin || isManager;

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        content: report.content || '',
      });
    } else {
      setFormData({ title: '', content: '' });
      setSelectedTaskId('');
      setProgress(0);
      setStatus('جديدة');
    }
  }, [report, open]);

  // Auto-set status based on progress
  useEffect(() => {
    if (progress === 100) {
      setStatus('مكتملة');
    } else if (progress > 0 && status === 'جديدة') {
      setStatus('قيد التنفيذ');
    }
  }, [progress]);

  // When task is selected, load its current progress
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find((t: any) => t.id === selectedTaskId);
      if (task) {
        setProgress(task.progress || 0);
        setStatus(task.status || 'جديدة');
      }
    }
  }, [selectedTaskId, tasks]);

  const getProgressColor = () => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build content with progress info for sub-users
      let finalContent = formData.content;
      if (!isManagerOrAdmin && selectedTaskId) {
        const selectedTask = tasks.find((t: any) => t.id === selectedTaskId);
        finalContent = `📋 المهمة: ${selectedTask?.title || ''}\n📊 نسبة الإنجاز: ${progress}%\n📌 الحالة: ${status}\n\n📝 ملاحظات:\n${formData.content}`;

        // Update the task progress and status
        await updateTask.mutateAsync({
          id: selectedTaskId,
          progress,
          status,
        });
      }

      if (report?.id) {
        await updateReport.mutateAsync({ id: report.id, title: formData.title, content: finalContent });
      } else {
        await createReport.mutateAsync({ title: formData.title, content: finalContent });
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
          {/* Task selection & progress - only for sub-users (not admin/manager) */}
          {!isManagerOrAdmin && !report && (
            <>
              <div className="space-y-2">
                <Label htmlFor="task-select">اختر المهمة</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المهمة لتحديث الإنجاز" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task: any) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} - {task.assigned_to}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTaskId && (
                <>
                  {/* Progress Slider */}
                  <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">نسبة الإنجاز</Label>
                      <span className={`text-2xl font-bold ${progress === 100 ? 'text-green-600' : 'text-primary'}`}>
                        {progress}%
                      </span>
                    </div>
                    <Slider
                      value={[progress]}
                      onValueChange={(val) => setProgress(val[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Status Select */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">حالة المهمة</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${opt.color}`} />
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </>
          )}

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
