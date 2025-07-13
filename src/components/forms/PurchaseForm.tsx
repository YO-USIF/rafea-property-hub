import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { usePurchases } from '@/hooks/usePurchases';
import { useProjects } from '@/hooks/useProjects';

interface Purchase {
  id?: string;
  order_number: string;
  supplier_name: string;
  project_name: string;
  project_id?: string;
  requested_by: string;
  order_date: string;
  expected_delivery: string;
  total_amount: number;
  status: string;
  delivery_status: string;
  approved_by?: string;
  attached_file_url?: string;
  attached_file_name?: string;
}

interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase;
  onSuccess: () => void;
}

const PurchaseForm = ({ open, onOpenChange, purchase, onSuccess }: PurchaseFormProps) => {
  const { createPurchase, updatePurchase } = usePurchases();
  const { toast } = useToast();
  const { projects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Purchase>({
    order_number: purchase?.order_number || `PO-${Date.now()}`,
    supplier_name: purchase?.supplier_name || '',
    project_name: purchase?.project_name || '',
    project_id: purchase?.project_id || "none",
    requested_by: purchase?.requested_by || '',
    order_date: purchase?.order_date || new Date().toISOString().split('T')[0],
    expected_delivery: purchase?.expected_delivery || '',
    total_amount: purchase?.total_amount || 0,
    status: purchase?.status || 'في انتظار الموافقة',
    delivery_status: purchase?.delivery_status || 'لم يتم التسليم',
    approved_by: purchase?.approved_by || '',
    attached_file_url: purchase?.attached_file_url || '',
    attached_file_name: purchase?.attached_file_name || ''
  });

  // تحديث البيانات عند تغيير العنصر المرسل للتعديل
  useEffect(() => {
    if (purchase) {
      setFormData({
        order_number: purchase.order_number || `PO-${Date.now()}`,
        supplier_name: purchase.supplier_name || '',
        project_name: purchase.project_name || '',
        project_id: purchase.project_id || "none",
        requested_by: purchase.requested_by || '',
        order_date: purchase.order_date || new Date().toISOString().split('T')[0],
        expected_delivery: purchase.expected_delivery || '',
        total_amount: purchase.total_amount || 0,
        status: purchase.status || 'في انتظار الموافقة',
        delivery_status: purchase.delivery_status || 'لم يتم التسليم',
        approved_by: purchase.approved_by || '',
        attached_file_url: purchase.attached_file_url || '',
        attached_file_name: purchase.attached_file_name || ''
      });
    } else {
      // إعادة تعيين النموذج للإضافة الجديدة
      setFormData({
        order_number: `PO-${Date.now()}`,
        supplier_name: '',
        project_name: '',
        project_id: "none",
        requested_by: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        total_amount: 0,
        status: 'في انتظار الموافقة',
        delivery_status: 'لم يتم التسليم',
        approved_by: '',
        attached_file_url: '',
        attached_file_name: ''
      });
    }
  }, [purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const purchasePayload = {
        ...formData,
        project_id: formData.project_id === "none" ? null : formData.project_id
      };
      
      if (purchase?.id) {
        await updatePurchase.mutateAsync({ id: purchase.id, ...purchasePayload });
      } else {
        await createPurchase.mutateAsync(purchasePayload);
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
            {purchase ? 'تعديل طلب الشراء' : 'إضافة طلب شراء جديد'}
          </DialogTitle>
          <DialogDescription>
            {purchase ? 'قم بتعديل بيانات طلب الشراء' : 'أدخل بيانات طلب الشراء الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">رقم الطلب</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                required
                disabled={!!purchase}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_name">اسم المورد</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
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
                    project_name: value === "none" ? "" : (selectedProject ? selectedProject.name : "")
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مشروع</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requested_by">طالب الشراء</Label>
              <Input
                id="requested_by"
                value={formData.requested_by}
                onChange={(e) => setFormData(prev => ({ ...prev, requested_by: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_date">تاريخ الطلب</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery">تاريخ التسليم المتوقع</Label>
              <Input
                id="expected_delivery"
                type="date"
                value={formData.expected_delivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">المبلغ الإجمالي (ر.س)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">حالة الموافقة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="في انتظار الموافقة">في انتظار الموافقة</SelectItem>
                  <SelectItem value="معتمد">معتمد</SelectItem>
                  <SelectItem value="مرفوض">مرفوض</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_status">حالة التسليم</Label>
              <Select
                value={formData.delivery_status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="لم يتم التسليم">لم يتم التسليم</SelectItem>
                  <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                  <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approved_by">معتمد من</Label>
              <Input
                id="approved_by"
                value={formData.approved_by}
                onChange={(e) => setFormData(prev => ({ ...prev, approved_by: e.target.value }))}
                placeholder="اختياري"
              />
            </div>
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
              {loading ? 'جارٍ الحفظ...' : (purchase ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseForm;