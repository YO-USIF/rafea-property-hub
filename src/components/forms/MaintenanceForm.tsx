import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MaintenanceRequest {
  id?: string;
  building_name: string;
  unit: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
  reported_date: string;
  assigned_to: string;
  estimated_cost: number;
}

interface MaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaintenanceRequest;
  onSuccess: () => void;
}

const MaintenanceForm = ({ open, onOpenChange, request, onSuccess }: MaintenanceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MaintenanceRequest>({
    building_name: request?.building_name || '',
    unit: request?.unit || '',
    issue_type: request?.issue_type || 'سباكة',
    description: request?.description || '',
    priority: request?.priority || 'متوسطة',
    status: request?.status || 'جديد',
    reported_date: request?.reported_date || new Date().toISOString().split('T')[0],
    assigned_to: request?.assigned_to || '',
    estimated_cost: request?.estimated_cost || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        user_id: user.id
      };

      if (request?.id) {
        const { error } = await supabase
          .from('maintenance_requests')
          .update(data)
          .eq('id', request.id);
        
        if (error) throw error;
        toast({ title: "تم تحديث طلب الصيانة بنجاح" });
      } else {
        const { error } = await supabase
          .from('maintenance_requests')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: "تم إنشاء طلب الصيانة بنجاح" });
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
            {request ? 'تعديل طلب الصيانة' : 'إضافة طلب صيانة جديد'}
          </DialogTitle>
          <DialogDescription>
            {request ? 'قم بتعديل بيانات طلب الصيانة' : 'أدخل بيانات طلب الصيانة الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building_name">اسم المبنى</Label>
              <Input
                id="building_name"
                value={formData.building_name}
                onChange={(e) => setFormData(prev => ({ ...prev, building_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">الوحدة</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_type">نوع العطل</Label>
              <Select
                value={formData.issue_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, issue_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سباكة">سباكة</SelectItem>
                  <SelectItem value="كهرباء">كهرباء</SelectItem>
                  <SelectItem value="تكييف">تكييف</SelectItem>
                  <SelectItem value="أعمال مدنية">أعمال مدنية</SelectItem>
                  <SelectItem value="نظافة">نظافة</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="جديد">جديد</SelectItem>
                  <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reported_date">تاريخ الإبلاغ</Label>
              <Input
                id="reported_date"
                type="date"
                value={formData.reported_date}
                onChange={(e) => setFormData(prev => ({ ...prev, reported_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">المسؤول</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                placeholder="غير محدد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_cost">التكلفة المقدرة (ر.س)</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف العطل</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف مفصل للعطل..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (request ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;