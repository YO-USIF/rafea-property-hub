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
import { useExtracts } from '@/hooks/useExtracts';
import { useProjects } from '@/hooks/useProjects';
import { useContractors } from '@/hooks/useContractors';
import { extractFormSchema, type ExtractFormData } from '@/lib/validationSchemas';
import { ZodError } from 'zod';

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
  tax_included?: boolean;
  tax_amount?: number;
  amount_before_tax?: number;
  assignment_order?: string;
  is_external_project?: boolean;
}

interface ExtractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extract?: Extract;
  onSuccess: () => void;
  isProjectManager?: boolean;
}

const ExtractForm = ({ open, onOpenChange, extract, onSuccess, isProjectManager = false }: ExtractFormProps) => {
  const { toast } = useToast();
  const { createExtract, updateExtract } = useExtracts();
  const { projects } = useProjects();
  const { contractors } = useContractors();
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
    attached_file_name: extract?.attached_file_name || '',
    tax_included: extract?.tax_included || false,
    tax_amount: extract?.tax_amount || 0,
    amount_before_tax: extract?.amount_before_tax || 0,
    assignment_order: extract?.assignment_order || '',
    is_external_project: extract?.is_external_project || false
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
        attached_file_name: extract.attached_file_name || '',
        tax_included: extract.tax_included || false,
        tax_amount: extract.tax_amount || 0,
        amount_before_tax: extract.amount_before_tax || 0,
        assignment_order: extract.assignment_order || '',
        is_external_project: extract.is_external_project || false
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
        attached_file_name: '',
        tax_included: false,
        tax_amount: 0,
        amount_before_tax: 0,
        assignment_order: '',
        is_external_project: false
      });
    }
  }, [extract]);

  // حساب الضريبة تلقائياً عند تغيير المبلغ أو حالة الضريبة
  useEffect(() => {
    if (formData.tax_included && formData.amount > 0) {
      // إذا كان المبلغ شامل الضريبة، نحسب المبلغ قبل الضريبة
      const amountBeforeTax = formData.amount / 1.15;
      const taxAmount = formData.amount - amountBeforeTax;
      setFormData(prev => ({
        ...prev,
        amount_before_tax: Math.round(amountBeforeTax * 100) / 100,
        tax_amount: Math.round(taxAmount * 100) / 100
      }));
    } else if (!formData.tax_included && formData.amount > 0) {
      // إذا كان المبلغ غير شامل الضريبة، المبلغ قبل الضريبة = المبلغ نفسه
      setFormData(prev => ({
        ...prev,
        amount_before_tax: formData.amount,
        tax_amount: 0
      }));
    }
  }, [formData.amount, formData.tax_included]);

  // حساب إجمالي المبلغ تلقائياً من المبلغ المدفوع سابقاً + قيمة المستخلص الحالي
  useEffect(() => {
    const total = (formData.previous_amount || 0) + (formData.current_amount || 0);
    if (formData.amount !== total) {
      setFormData(prev => ({
        ...prev,
        amount: total
      }));
    }
  }, [formData.previous_amount, formData.current_amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const extractPayload = {
        extract_number: formData.extract_number && formData.extract_number.trim() !== '' ? formData.extract_number : undefined,
        contractor_name: formData.contractor_name,
        project_name: formData.project_name,
        project_id: formData.project_id === "none" || formData.project_id === "external" || !formData.project_id ? null : formData.project_id,
        amount: Number(formData.amount),
        amount_before_tax: formData.amount_before_tax ? Number(formData.amount_before_tax) : undefined,
        tax_amount: formData.tax_amount ? Number(formData.tax_amount) : undefined,
        tax_included: formData.tax_included,
        description: formData.description,
        extract_date: formData.extract_date,
        status: isProjectManager ? 'قيد المراجعة' : formData.status,
        percentage_completed: formData.percentage_completed ? Number(formData.percentage_completed) : undefined,
        current_amount: formData.current_amount ? Number(formData.current_amount) : undefined,
        previous_amount: formData.previous_amount ? Number(formData.previous_amount) : undefined,
        attached_file_url: formData.attached_file_url,
        attached_file_name: formData.attached_file_name,
        assignment_order: formData.assignment_order,
        is_external_project: formData.is_external_project,
      };

      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = extractFormSchema.parse(extractPayload);

      if (extract?.id) {
        await updateExtract.mutateAsync({ id: extract.id, ...validatedData });
      } else {
        await createExtract.mutateAsync(validatedData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving extract:', error);
      if (error.name === 'ZodError') {
        // عرض أخطاء التحقق للمستخدم
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
                placeholder="سيتم إنشاؤه تلقائياً"
                disabled={!extract?.id}
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
                    project_name: value === "none" ? "" : value === "multiple" ? "المشروعين مع بعض" : value === "external" ? "مشروع خارجي" : (selectedProject ? selectedProject.name : ""),
                    is_external_project: value === "external"
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مشروع</SelectItem>
                  <SelectItem value="external">مشروع خارجي</SelectItem>
                  <SelectItem value="multiple">المشروعين مع بعض</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.is_external_project && (
              <div className="space-y-2">
                <Label htmlFor="external_project_name">اسم المشروع الخارجي</Label>
                <Input
                  id="external_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="أدخل اسم المشروع الخارجي"
                  required={formData.is_external_project}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="assignment_order">رقم أمر التكليف</Label>
              <Input
                id="assignment_order"
                value={formData.assignment_order}
                onChange={(e) => setFormData(prev => ({ ...prev, assignment_order: e.target.value }))}
                placeholder="أدخل رقم أمر التكليف (اختياري)"
              />
              <p className="text-xs text-muted-foreground">رقم أمر التكليف للأعمال اليومية في المشروع</p>
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
              <Label htmlFor="previous_amount">المبلغ المدفوع سابقاً</Label>
              <Input
                id="previous_amount"
                type="number"
                step="0.01"
                value={formData.previous_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, previous_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount">قيمة المستخلص الحالي</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                value={formData.current_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">إجمالي المبلغ</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                disabled
                className="bg-muted/50 font-bold text-primary"
              />
              <p className="text-xs text-muted-foreground">يحسب تلقائياً: المبلغ المدفوع سابقاً + قيمة المستخلص الحالي</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={isProjectManager}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  {!isProjectManager && (
                    <>
                      <SelectItem value="معتمد">معتمد</SelectItem>
                      <SelectItem value="مدفوع">مدفوع</SelectItem>
                      <SelectItem value="مرفوض">مرفوض</SelectItem>
                    </>
                  )}
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