import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { useProjects } from '@/hooks/useProjects';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useUserRole } from '@/hooks/useUserRole';
import { invoiceFormSchema, type InvoiceFormData } from '@/lib/validationSchemas';
import { ZodError } from 'zod';

interface Invoice {
  id?: string;
  invoice_number: string;
  supplier_name: string;
  project_id?: string;
  amount: number;
  description: string;
  invoice_date: string;
  due_date: string;
  status: string;
  attached_file_url?: string;
  attached_file_name?: string;
}

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess: () => void;
}

const InvoiceForm = ({ open, onOpenChange, invoice, onSuccess }: InvoiceFormProps) => {
  console.log('=== INVOICE FORM COMPONENT LOADED ===', { open, invoice });
  const { toast } = useToast();
  const { createInvoice, updateInvoice } = useInvoices();
  const { projects } = useProjects();
  const { suppliers } = useSuppliers();
  const { isManager, isAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Invoice>({
    invoice_number: invoice?.invoice_number || '',
    supplier_name: invoice?.supplier_name || '',
    project_id: invoice?.project_id || null,
    amount: invoice?.amount || 0,
    description: invoice?.description || '',
    invoice_date: invoice?.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    status: invoice?.status || 'غير مدفوع',
    attached_file_url: invoice?.attached_file_url || '',
    attached_file_name: invoice?.attached_file_name || ''
  });

  // تحديث البيانات عند تغيير العنصر المرسل للتعديل
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number || '',
        supplier_name: invoice.supplier_name || '',
        project_id: invoice.project_id || null,
        amount: invoice.amount || 0,
        description: invoice.description || '',
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        status: invoice.status || 'غير مدفوع',
        attached_file_url: invoice.attached_file_url || '',
        attached_file_name: invoice.attached_file_name || ''
      });
    } else {
      // إعادة تعيين النموذج للإضافة الجديدة
      setFormData({
        invoice_number: '',
        supplier_name: '',
        project_id: null,
        amount: 0,
        description: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'غير مدفوع',
        attached_file_url: '',
        attached_file_name: ''
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== INVOICE FORM SUBMIT ===');
    console.log('Form data:', formData);
    console.log('User permissions:', { isManager, isAdmin });
    console.log('Invoice being updated:', invoice);
    setLoading(true);

    try {
      const invoicePayload = {
        invoice_number: formData.invoice_number,
        supplier_name: formData.supplier_name,
        project_id: formData.project_id === "none" || formData.project_id === "multiple" || !formData.project_id ? null : formData.project_id,
        amount: Number(formData.amount),
        description: formData.description,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        status: formData.status,
        attached_file_url: formData.attached_file_url,
        attached_file_name: formData.attached_file_name
      };

      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = invoiceFormSchema.parse(invoicePayload);

      console.log('Validated invoice data:', validatedData);

      if (invoice?.id) {
        console.log('Updating invoice with ID:', invoice.id);
        const result = await updateInvoice.mutateAsync({ id: invoice.id, ...validatedData });
        console.log('Update result:', result);
      } else {
        console.log('Creating new invoice');
        const result = await createInvoice.mutateAsync(validatedData);
        console.log('Create result:', result);
      }
      
      console.log('Invoice operation successful');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
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
          title: "خطأ في حفظ الفاتورة", 
          description: error.message || "حدث خطأ غير متوقع",
          variant: "destructive" 
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
            {invoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}
          </DialogTitle>
          <DialogDescription>
            {invoice ? 'قم بتعديل بيانات الفاتورة' : 'أدخل بيانات الفاتورة الجديدة'}
          </DialogDescription>
        </DialogHeader>

        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                disabled={!isManager && !isAdmin && !!invoice}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">اسم المورد</Label>
              <Select
                value={formData.supplier_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_name: value }))}
                disabled={!isManager && !isAdmin && !!invoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">المشروع</Label>
              <Select
                value={formData.project_id || "none"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value === "none" ? null : value }))}
                disabled={!isManager && !isAdmin && !!invoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مشروع</SelectItem>
                  <SelectItem value="suhail-ab">مشروع سهيل A/B</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">تاريخ الفاتورة</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={!isManager && !isAdmin && !!invoice}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="غير مدفوع">غير مدفوع</SelectItem>
                  <SelectItem value="مدفوع">مدفوع</SelectItem>
                  <SelectItem value="متأخر">متأخر</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
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
              {loading ? 'جارٍ الحفظ...' : (invoice ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;