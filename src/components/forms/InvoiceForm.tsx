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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Invoice>({
    invoice_number: invoice?.invoice_number || '',
    supplier_name: invoice?.supplier_name || '',
    project_id: invoice?.project_id || '',
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
        project_id: invoice.project_id || '',
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
        project_id: '',
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
    setLoading(true);

    try {
      const invoicePayload = {
        invoice_number: formData.invoice_number,
        supplier_name: formData.supplier_name,
        project_id: formData.project_id || null,
        amount: formData.amount,
        description: formData.description,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        status: formData.status,
        attached_file_url: formData.attached_file_url,
        attached_file_name: formData.attached_file_name
      };

      console.log('Invoice payload:', invoicePayload);

      if (invoice?.id) {
        console.log('Updating invoice with ID:', invoice.id);
        await updateInvoice.mutateAsync({ id: invoice.id, ...invoicePayload });
      } else {
        console.log('Creating new invoice');
        await createInvoice.mutateAsync(invoicePayload);
      }
      
      console.log('Invoice operation successful');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">اسم المورد</Label>
              <Input
                id="supplierName"
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">المشروع</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون مشروع</SelectItem>
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