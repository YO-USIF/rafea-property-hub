import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useTaskReports } from '@/hooks/useTaskReports';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface TaskProgressReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onSuccess: () => void;
}

const statusOptions = [
  { value: 'جديدة', label: 'جديدة', icon: Clock, color: 'text-yellow-600' },
  { value: 'قيد التنفيذ', label: 'قيد التنفيذ', icon: Loader2, color: 'text-blue-600' },
  { value: 'مكتملة', label: 'مكتملة', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'متأخرة', label: 'متأخرة', icon: AlertTriangle, color: 'text-red-600' },
];

const TaskProgressReportForm = ({ open, onOpenChange, task, onSuccess }: TaskProgressReportFormProps) => {
  const { updateTask } = useTasks();
  const { createReport } = useTaskReports();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (task) {
      setProgress(task.progress || 0);
      setStatus(task.status || 'جديدة');
      setNotes('');
    }
  }, [task]);

  // Auto-set status based on progress
  useEffect(() => {
    if (progress === 100) {
      setStatus('مكتملة');
    } else if (progress > 0 && status === 'جديدة') {
      setStatus('قيد التنفيذ');
    }
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setLoading(true);

    try {
      // Update task progress and status
      await updateTask.mutateAsync({
        id: task.id,
        progress,
        status,
      });

      // Create a report entry
      await createReport.mutateAsync({
        title: `تقرير تحديث: ${task.title}`,
        content: `📋 المهمة: ${task.title}\n👤 المسؤول: ${task.assigned_to}\n📊 نسبة الإنجاز: ${progress}%\n📌 الحالة: ${status}\n\n📝 ملاحظات:\n${notes || 'لا توجد ملاحظات'}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting progress report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const getProgressColor = () => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">تقرير تحديث المهمة</DialogTitle>
          <DialogDescription>
            قم بتحديث نسبة الإنجاز وحالة المهمة
          </DialogDescription>
        </DialogHeader>

        {/* Task Info Card */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>👤 {task.assigned_to}</span>
            <span>📅 {task.due_date}</span>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Slider */}
          <div className="space-y-3">
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

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">ملاحظات التحديث</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك حول سير العمل في المهمة..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : 'تحديث المهمة'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskProgressReportForm;
