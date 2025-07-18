import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSales } from '@/hooks/useSales';

interface Sale {
  id?: string;
  customer_name: string;
  customer_phone?: string;
  project_name: string;
  unit_number: string;
  unit_type: string;
  area: number;
  price: number;
  remaining_amount?: number;
  status: string;
  sale_date?: string;
  installment_plan?: string;
}

interface SaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale?: Sale;
  onSuccess: () => void;
}

const SaleForm = ({ open, onOpenChange, sale, onSuccess }: SaleFormProps) => {
  const { createSale, updateSale } = useSales();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Sale>({
    customer_name: sale?.customer_name || '',
    customer_phone: sale?.customer_phone || '',
    project_name: sale?.project_name || '',
    unit_number: sale?.unit_number || '',
    unit_type: sale?.unit_type || 'شقة',
    area: sale?.area || 0,
    price: sale?.price || 0,
    remaining_amount: sale?.remaining_amount || 0,
    status: sale?.status || 'متاح',
    sale_date: sale?.sale_date || '',
    installment_plan: sale?.installment_plan || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (sale?.id) {
        await updateSale.mutateAsync({ id: sale.id, ...formData });
      } else {
        await createSale.mutateAsync(formData);
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
            {sale ? 'تعديل عملية البيع' : 'إضافة عملية بيع جديدة'}
          </DialogTitle>
          <DialogDescription>
            {sale ? 'قم بتعديل بيانات عملية البيع' : 'أدخل بيانات عملية البيع الجديدة'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">اسم العميل</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">هاتف العميل</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_name">اسم المشروع</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_number">رقم الوحدة</Label>
              <Input
                id="unit_number"
                value={formData.unit_number}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_type">نوع الوحدة</Label>
              <Select
                value={formData.unit_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="شقة">شقة</SelectItem>
                  <SelectItem value="فيلا">فيلا</SelectItem>
                  <SelectItem value="دوبلكس">دوبلكس</SelectItem>
                  <SelectItem value="استوديو">استوديو</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">المساحة (م²)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">السعر (ر.س)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining_amount">المبلغ المتبقي (ر.س)</Label>
              <Input
                id="remaining_amount"
                type="number"
                value={formData.remaining_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, remaining_amount: parseInt(e.target.value) || 0 }))}
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
                  <SelectItem value="متاح">متاح</SelectItem>
                  <SelectItem value="محجوز">محجوز</SelectItem>
                  <SelectItem value="مباع">مباع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_date">تاريخ البيع</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installment_plan">خطة التقسيط</Label>
              <Input
                id="installment_plan"
                value={formData.installment_plan}
                onChange={(e) => setFormData(prev => ({ ...prev, installment_plan: e.target.value }))}
                placeholder="مثال: 24 شهر"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (sale ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleForm;