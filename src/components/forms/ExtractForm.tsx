import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Extract {
  id?: string;
  extractNumber: string;
  contractorName: string;
  projectName: string;
  extractAmount: number;
  workDescription: string;
  submissionDate: string;
  approvalDate?: string;
  status: string;
}

interface ExtractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extract?: Extract;
  onSuccess: () => void;
}

const ExtractForm = ({ open, onOpenChange, extract, onSuccess }: ExtractFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Extract>({
    extractNumber: extract?.extractNumber || '',
    contractorName: extract?.contractorName || '',
    projectName: extract?.projectName || '',
    extractAmount: extract?.extractAmount || 0,
    workDescription: extract?.workDescription || '',
    submissionDate: extract?.submissionDate || new Date().toISOString().split('T')[0],
    approvalDate: extract?.approvalDate || '',
    status: extract?.status || 'قيد المراجعة'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم الحفظ",
        description: extract ? "تم تحديث المستخلص بنجاح" : "تم إضافة المستخلص بنجاح"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المستخلص",
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
            {extract ? 'تعديل المستخلص' : 'إضافة مستخلص جديد'}
          </DialogTitle>
          <DialogDescription>
            {extract ? 'قم بتعديل بيانات المستخلص' : 'أدخل بيانات المستخلص الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extractNumber">رقم المستخلص</Label>
              <Input
                id="extractNumber"
                value={formData.extractNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, extractNumber: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractorName">اسم المقاول</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) => setFormData(prev => ({ ...prev, contractorName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">اسم المشروع</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extractAmount">قيمة المستخلص</Label>
              <Input
                id="extractAmount"
                type="number"
                value={formData.extractAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, extractAmount: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDate">تاريخ التقديم</Label>
              <Input
                id="submissionDate"
                type="date"
                value={formData.submissionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, submissionDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalDate">تاريخ الاعتماد</Label>
              <Input
                id="approvalDate"
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, approvalDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  <SelectItem value="معتمد">معتمد</SelectItem>
                  <SelectItem value="مدفوع">مدفوع</SelectItem>
                  <SelectItem value="مرفوض">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workDescription">وصف الأعمال</Label>
            <Textarea
              id="workDescription"
              value={formData.workDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, workDescription: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (extract ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractForm;