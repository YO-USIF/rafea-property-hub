import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAssignmentOrders } from '@/hooks/useAssignmentOrders';
import { useProjects } from '@/hooks/useProjects';
import { useContractors } from '@/hooks/useContractors';
import { assignmentOrderSchema, type AssignmentOrderFormData } from '@/lib/assignmentOrderSchemas';

interface AssignmentOrder {
  id?: string;
  order_number: string;
  contractor_name: string;
  project_name: string;
  project_id?: string;
  amount: number;
  description: string;
  order_date: string;
  status: string;
  work_type?: string;
  duration_days?: number;
  attached_file_url?: string;
  attached_file_name?: string;
  tax_included?: boolean;
  tax_amount?: number;
  amount_before_tax?: number;
}

interface AssignmentOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: AssignmentOrder;
  onSuccess: () => void;
}

const AssignmentOrderForm = ({ open, onOpenChange, order, onSuccess }: AssignmentOrderFormProps) => {
  const { toast } = useToast();
  const { createAssignmentOrder, updateAssignmentOrder } = useAssignmentOrders();
  const { projects } = useProjects();
  const { contractors } = useContractors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssignmentOrder>({
    order_number: order?.order_number || '',
    contractor_name: order?.contractor_name || '',
    project_name: order?.project_name || '',
    project_id: order?.project_id || "none",
    amount: order?.amount || 0,
    description: order?.description || '',
    order_date: order?.order_date || new Date().toISOString().split('T')[0],
    status: order?.status || 'قيد التنفيذ',
    work_type: order?.work_type || '',
    duration_days: order?.duration_days || 0,
    attached_file_url: order?.attached_file_url || '',
    attached_file_name: order?.attached_file_name || '',
    tax_included: order?.tax_included || false,
    tax_amount: order?.tax_amount || 0,
    amount_before_tax: order?.amount_before_tax || 0
  });

  useEffect(() => {
    if (order) {
      setFormData({
        order_number: order.order_number || '',
        contractor_name: order.contractor_name || '',
        project_name: order.project_name || '',
        project_id: order.project_id || "none",
        amount: order.amount || 0,
        description: order.description || '',
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        status: order.status || 'قيد التنفيذ',
        work_type: order.work_type || '',
        duration_days: order.duration_days || 0,
        attached_file_url: order.attached_file_url || '',
        attached_file_name: order.attached_file_name || '',
        tax_included: order.tax_included || false,
        tax_amount: order.tax_amount || 0,
        amount_before_tax: order.amount_before_tax || 0
      });
    } else {
      setFormData({
        order_number: '',
        contractor_name: '',
        project_name: '',
        project_id: "none",
        amount: 0,
        description: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'قيد التنفيذ',
        work_type: '',
        duration_days: 0,
        attached_file_url: '',
        attached_file_name: '',
        tax_included: false,
        tax_amount: 0,
        amount_before_tax: 0
      });
    }
  }, [order]);

  useEffect(() => {
    if (formData.tax_included && formData.amount > 0) {
      const amountBeforeTax = formData.amount / 1.15;
      const taxAmount = formData.amount - amountBeforeTax;
      setFormData(prev => ({
        ...prev,
        amount_before_tax: Math.round(amountBeforeTax * 100) / 100,
        tax_amount: Math.round(taxAmount * 100) / 100
      }));
    } else if (!formData.tax_included && formData.amount > 0) {
      setFormData(prev => ({
        ...prev,
        amount_before_tax: formData.amount,
        tax_amount: 0
      }));
    }
  }, [formData.amount, formData.tax_included]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        order_number: formData.order_number && formData.order_number.trim() !== '' ? formData.order_number : undefined,
        contractor_name: formData.contractor_name,
        project_name: formData.project_name,
        project_id: formData.project_id === "none" || formData.project_id === "external" || !formData.project_id ? null : formData.project_id,
        amount: Number(formData.amount),
        amount_before_tax: formData.amount_before_tax ? Number(formData.amount_before_tax) : undefined,
        tax_amount: formData.tax_amount ? Number(formData.tax_amount) : undefined,
        tax_included: formData.tax_included,
        description: formData.description,
        order_date: formData.order_date,
        status: formData.status,
        work_type: formData.work_type,
        duration_days: formData.duration_days ? Number(formData.duration_days) : undefined,
        attached_file_url: formData.attached_file_url,
        attached_file_name: formData.attached_file_name,
      };

      const validatedData = assignmentOrderSchema.parse(orderPayload);

      if (order?.id) {
        await updateAssignmentOrder.mutateAsync({ id: order.id, ...validatedData });
      } else {
        await createAssignmentOrder.mutateAsync(validatedData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving assignment order:', error);
      if (error.name === 'ZodError') {
        const errorMessage = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n');
        toast({
          title: 'بيانات غير صحيحة',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'حدث خطأ أثناء حفظ البيانات',
          description: 'يرجى المحاولة مرة أخرى',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? 'تعديل أمر التكليف' : 'إضافة أمر تكليف جديد'}
          </DialogTitle>
          <DialogDescription>
            {order ? 'قم بتعديل بيانات أمر التكليف' : 'أدخل بيانات أمر التكليف الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">رقم أمر التكليف</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                placeholder="سيتم إنشاؤه تلقائياً"
                disabled={!order?.id}
              />
              <p className="text-xs text-muted-foreground">سيتم إنشاء الرقم تلقائياً عند الحفظ</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor_name">اسم المقاول</Label>
              <Select
                value={formData.contractor_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المقاول" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor: any) => (
                    <SelectItem key={contractor.id} value={contractor.name}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">المشروع</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => {
                  const selectedProject = projects.find((p: any) => p.id === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    project_id: value === "none" ? "" : value === "external" ? "external" : value,
                    project_name: value === "none" ? "" : value === "external" ? "" : (selectedProject ? selectedProject.name : "")
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مشروع</SelectItem>
                  <SelectItem value="external">مشروع خارجي</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.project_id === "external" && (
              <div className="space-y-2">
                <Label htmlFor="external_project_name">اسم المشروع الخارجي</Label>
                <Input
                  id="external_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="أدخل اسم المشروع الخارجي"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="order_date">تاريخ أمر التكليف</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_type">نوع العمل</Label>
              <Input
                id="work_type"
                value={formData.work_type}
                onChange={(e) => setFormData(prev => ({ ...prev, work_type: e.target.value }))}
                placeholder="مثال: أعمال يومية، صيانة، إلخ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">مدة العمل (أيام)</Label>
              <Input
                id="duration_days"
                type="number"
                min="0"
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="tax_included"
                  checked={formData.tax_included}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tax_included: checked as boolean }))
                  }
                />
                <Label htmlFor="tax_included" className="cursor-pointer">
                  شامل ضريبة القيمة المضافة 15%
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            {formData.tax_included && formData.amount > 0 && (
              <>
                <div className="space-y-2">
                  <Label>المبلغ قبل الضريبة</Label>
                  <Input
                    type="number"
                    value={formData.amount_before_tax?.toFixed(2) || 0}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label>قيمة الضريبة (15%)</Label>
                  <Input
                    type="number"
                    value={formData.tax_amount?.toFixed(2) || 0}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            )}

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
                  <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
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
              {loading ? 'جارٍ الحفظ...' : (order ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentOrderForm;
