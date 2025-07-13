import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useExtracts } from '@/hooks/useExtracts';
import { useProjects } from '@/hooks/useProjects';

interface Extract {
  id?: string;
  extract_number: string;
  contractor_name: string;
  project_name: string;
  project_id?: string;
  amount: number;
  description: string;
  extract_date: string;
  status: string;
  percentage_completed?: number;
  current_amount?: number;
  previous_amount?: number;
  attached_file_url?: string;
  attached_file_name?: string;
}

interface ExtractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extract?: Extract;
  onSuccess: () => void;
}

const ExtractForm = ({ open, onOpenChange, extract, onSuccess }: ExtractFormProps) => {
  const { toast } = useToast();
  const { createExtract, updateExtract } = useExtracts();
  const { projects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Extract>({
    extract_number: extract?.extract_number || '',
    contractor_name: extract?.contractor_name || '',
    project_name: extract?.project_name || '',
    project_id: extract?.project_id || "none",
    amount: extract?.amount || 0,
    description: extract?.description || '',
    extract_date: extract?.extract_date || new Date().toISOString().split('T')[0],
    status: extract?.status || 'قيد المراجعة',
    percentage_completed: extract?.percentage_completed || 0,
    current_amount: extract?.current_amount || 0,
    previous_amount: extract?.previous_amount || 0,
    attached_file_url: extract?.attached_file_url || '',
    attached_file_name: extract?.attached_file_name || ''
  });

  // تحديث البيانات عند تغيير العنصر المرسل للتعديل
  useEffect(() => {
    if (extract) {
      setFormData({
        extract_number: extract.extract_number || '',
        contractor_name: extract.contractor_name || '',
        project_name: extract.project_name || '',
        project_id: extract.project_id || "none",
        amount: extract.amount || 0,
        description: extract.description || '',
        extract_date: extract.extract_date || new Date().toISOString().split('T')[0],
        status: extract.status || 'قيد المراجعة',
        percentage_completed: extract.percentage_completed || 0,
        current_amount: extract.current_amount || 0,
        previous_amount: extract.previous_amount || 0,
        attached_file_url: extract.attached_file_url || '',
        attached_file_name: extract.attached_file_name || ''
      });
    } else {
      setFormData({
        extract_number: '',
        contractor_name: '',
        project_name: '',
        project_id: "none",
        amount: 0,
        description: '',
        extract_date: new Date().toISOString().split('T')[0],
        status: 'قيد المراجعة',
        percentage_completed: 0,
        current_amount: 0,
        previous_amount: 0,
        attached_file_url: '',
        attached_file_name: ''
      });
    }
  }, [extract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const extractPayload = {
        extract_number: formData.extract_number,
        contractor_name: formData.contractor_name,
        project_name: formData.project_name,
        project_id: formData.project_id === "none" || formData.project_id === "multiple" ? null : formData.project_id,
        amount: formData.amount,
        description: formData.description,
        extract_date: formData.extract_date,
        status: formData.status,
        percentage_completed: formData.percentage_completed,
        current_amount: formData.current_amount,
        previous_amount: formData.previous_amount,
        attached_file_url: formData.attached_file_url,
        attached_file_name: formData.attached_file_name
      };

      if (extract?.id) {
        await updateExtract.mutateAsync({ id: extract.id, ...extractPayload });
      } else {
        await createExtract.mutateAsync(extractPayload);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving extract:', error);
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
              <Label htmlFor="extract_number">رقم المستخلص</Label>
              <Input
                id="extract_number"
                value={formData.extract_number}
                onChange={(e) => setFormData(prev => ({ ...prev, extract_number: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor_name">اسم المقاول</Label>
              <Input
                id="contractor_name"
                value={formData.contractor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contractor_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">المشروع</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => {
                  const selectedProject = projects.find((p: any) => p.id === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    project_id: value === "none" ? "" : value,
                    project_name: value === "none" ? "" : value === "multiple" ? "المشروعين مع بعض" : (selectedProject ? selectedProject.name : "")
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مشروع</SelectItem>
                  <SelectItem value="multiple">المشروعين مع بعض</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">قيمة المستخلص</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extract_date">تاريخ المستخلص</Label>
              <Input
                id="extract_date"
                type="date"
                value={formData.extract_date}
                onChange={(e) => setFormData(prev => ({ ...prev, extract_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage_completed">نسبة الإنجاز (%)</Label>
              <Input
                id="percentage_completed"
                type="number"
                min="0"
                max="100"
                value={formData.percentage_completed}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage_completed: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_amount">المبلغ السابق</Label>
              <Input
                id="previous_amount"
                type="number"
                step="0.01"
                value={formData.previous_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, previous_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount">المبلغ الحالي</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                value={formData.current_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
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
            <Label htmlFor="description">وصف الأعمال</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <FileUpload
            onFileUploaded={(fileUrl, fileName) => {
              setFormData(prev => ({
                ...prev,
                attached_file_url: fileUrl,
                attached_file_name: fileName
              }));
            }}
            currentFileUrl={formData.attached_file_url}
            currentFileName={formData.attached_file_name}
            onFileRemoved={() => {
              setFormData(prev => ({
                ...prev,
                attached_file_url: '',
                attached_file_name: ''
              }));
            }}
          />

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