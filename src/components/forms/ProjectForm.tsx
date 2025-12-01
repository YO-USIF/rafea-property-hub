import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id?: string;
  name: string;
  type: string;
  location: string;
  total_units: number;
  sold_units: number;
  total_cost: number;
  progress: number;
  start_date: string;
  expected_completion: string;
  status: string;
}

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSuccess: () => void;
}

const ProjectForm = ({ open, onOpenChange, project, onSuccess }: ProjectFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Project>({
    name: '',
    type: 'سكني',
    location: '',
    total_units: 0,
    sold_units: 0,
    total_cost: 0,
    progress: 0,
    start_date: '',
    expected_completion: '',
    status: 'قيد التنفيذ'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        type: project.type || 'سكني',
        location: project.location || '',
        total_units: project.total_units || 0,
        sold_units: project.sold_units || 0,
        total_cost: project.total_cost || 0,
        progress: project.progress || 0,
        start_date: project.start_date || '',
        expected_completion: project.expected_completion || '',
        status: project.status || 'قيد التنفيذ'
      });
    } else {
      setFormData({
        name: '',
        type: 'سكني',
        location: '',
        total_units: 0,
        sold_units: 0,
        total_cost: 0,
        progress: 0,
        start_date: '',
        expected_completion: '',
        status: 'قيد التنفيذ'
      });
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        user_id: user.id
      };

      if (project?.id) {
        const { error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', project.id);
        
        if (error) throw error;
        toast({ title: "تم تحديث المشروع بنجاح" });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: "تم إنشاء المشروع بنجاح" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
          </DialogTitle>
          <DialogDescription>
            {project ? 'قم بتعديل بيانات المشروع' : 'أدخل بيانات المشروع الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المشروع</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع المشروع</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سكني">سكني</SelectItem>
                  <SelectItem value="تجاري">تجاري</SelectItem>
                  <SelectItem value="مختلط">مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_units">إجمالي الوحدات</Label>
              <Input
                id="total_units"
                type="number"
                value={formData.total_units}
                onChange={(e) => setFormData(prev => ({ ...prev, total_units: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sold_units">الوحدات المباعة</Label>
              <Input
                id="sold_units"
                type="number"
                value={formData.sold_units}
                onChange={(e) => setFormData(prev => ({ ...prev, sold_units: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_cost">التكلفة الإجمالية (يتم حسابها تلقائياً)</Label>
              <Input
                id="total_cost"
                type="number"
                value={formData.total_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, total_cost: parseInt(e.target.value) || 0 }))}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                يتم حساب التكلفة تلقائياً من المستخلصات والفواتير وأوامر التكليف
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">نسبة الإنجاز (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">تاريخ البداية</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_completion">تاريخ الانتهاء المتوقع</Label>
              <Input
                id="expected_completion"
                type="date"
                value={formData.expected_completion}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_completion: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (project ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;