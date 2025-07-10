import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';

interface Invoice {
  id?: string;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  description: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
}

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess: () => void;
}

const InvoiceForm = ({ open, onOpenChange, invoice, onSuccess }: InvoiceFormProps) => {
  const { toast } = useToast();
  const { createInvoice, updateInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Invoice>({
    invoiceNumber: invoice?.invoiceNumber || '',
    supplierName: invoice?.supplierName || '',
    amount: invoice?.amount || 0,
    description: invoice?.description || '',
    invoiceDate: invoice?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    status: invoice?.status || 'غير مدفوع'
  });

  // تحديث البيانات عند تغيير العنصر المرسل للتعديل
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        supplierName: invoice.supplierName || '',
        amount: invoice.amount || 0,
        description: invoice.description || '',
        invoiceDate: invoice.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || '',
        status: invoice.status || 'غير مدفوع'
      });
    } else {
      // إعادة تعيين النموذج للإضافة الجديدة
      setFormData({
        invoiceNumber: '',
        supplierName: '',
        amount: 0,
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'غير مدفوع'
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoicePayload = {
        invoice_number: formData.invoiceNumber,
        supplier_name: formData.supplierName,
        amount: formData.amount,
        description: formData.description,
        invoice_date: formData.invoiceDate,
        due_date: formData.dueDate,
        status: formData.status
      };

      if (invoice?.id) {
        await updateInvoice.mutateAsync({ id: invoice.id, ...invoicePayload });
      } else {
        await createInvoice.mutateAsync(invoicePayload);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
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
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">اسم المورد</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                required
              />
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
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
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