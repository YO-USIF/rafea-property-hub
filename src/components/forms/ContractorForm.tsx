import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useContractors } from '@/hooks/useContractors';

interface Contractor {
  id?: string;
  name: string;
  company?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  status: string;
}

interface ContractorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: Contractor;
  onSuccess: () => void;
}

const ContractorForm = ({ open, onOpenChange, contractor, onSuccess }: ContractorFormProps) => {
  const { createContractor, updateContractor } = useContractors();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Contractor>({
    name: contractor?.name || '',
    company: contractor?.company || '',
    specialization: contractor?.specialization || 'البناء والتشييد',
    phone: contractor?.phone || '',
    email: contractor?.email || '',
    status: contractor?.status || 'نشط'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (contractor?.id) {
        await updateContractor.mutateAsync({ id: contractor.id, ...formData });
      } else {
        await createContractor.mutateAsync(formData);
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
            {contractor ? 'تعديل المقاول' : 'إضافة مقاول جديد'}
          </DialogTitle>
          <DialogDescription>
            {contractor ? 'قم بتعديل بيانات المقاول' : 'أدخل بيانات المقاول الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المقاول</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">التخصص</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="البناء والتشييد">البناء والتشييد</SelectItem>
                  <SelectItem value="الكهرباء">الكهرباء</SelectItem>
                  <SelectItem value="السباكة">السباكة</SelectItem>
                  <SelectItem value="التكييف">التكييف</SelectItem>
                  <SelectItem value="التشطيبات">التشطيبات</SelectItem>
                  <SelectItem value="الدهانات">الدهانات</SelectItem>
                  <SelectItem value="الألمنيوم">الألمنيوم</SelectItem>
                  <SelectItem value="النجارة">النجارة</SelectItem>
                  <SelectItem value="السيراميك والبلاط">السيراميك والبلاط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="غير نشط">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (contractor ? 'تحديث' : 'إنشاء')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorForm;