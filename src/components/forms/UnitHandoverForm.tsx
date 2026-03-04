import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UnitHandover {
  id?: string;
  project_name: string;
  project_id?: string;
  unit_number: string;
  unit_type: string;
  floor_number: string;
  building_name: string;
  customer_name: string;
  customer_phone: string;
  customer_id_number: string;
  handover_date: string;
  status: string;
  electricity_meter_reading: string;
  water_meter_reading: string;
  keys_delivered: number;
  keys_description: string;
  check_electricity: boolean;
  check_plumbing: boolean;
  check_painting: boolean;
  check_flooring: boolean;
  check_doors_windows: boolean;
  check_ac: boolean;
  check_kitchen: boolean;
  check_bathrooms: boolean;
  warranty_period_months: number;
  warranty_notes: string;
  notes: string;
  customer_signature_confirmed: boolean;
}

interface UnitHandoverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handover?: any;
  onSuccess: () => void;
}

const defaultFormData: UnitHandover = {
  project_name: '',
  unit_number: '',
  unit_type: 'شقة',
  floor_number: '',
  building_name: '',
  customer_name: '',
  customer_phone: '',
  customer_id_number: '',
  handover_date: new Date().toISOString().split('T')[0],
  status: 'قيد التسليم',
  electricity_meter_reading: '',
  water_meter_reading: '',
  keys_delivered: 0,
  keys_description: '',
  check_electricity: false,
  check_plumbing: false,
  check_painting: false,
  check_flooring: false,
  check_doors_windows: false,
  check_ac: false,
  check_kitchen: false,
  check_bathrooms: false,
  warranty_period_months: 12,
  warranty_notes: '',
  notes: '',
  customer_signature_confirmed: false,
};

const UnitHandoverForm = ({ open, onOpenChange, handover, onSuccess }: UnitHandoverFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UnitHandover>(defaultFormData);

  useEffect(() => {
    if (handover) {
      setFormData({
        project_name: handover.project_name || '',
        project_id: handover.project_id,
        unit_number: handover.unit_number || '',
        unit_type: handover.unit_type || 'شقة',
        floor_number: handover.floor_number || '',
        building_name: handover.building_name || '',
        customer_name: handover.customer_name || '',
        customer_phone: handover.customer_phone || '',
        customer_id_number: handover.customer_id_number || '',
        handover_date: handover.handover_date || new Date().toISOString().split('T')[0],
        status: handover.status || 'قيد التسليم',
        electricity_meter_reading: handover.electricity_meter_reading || '',
        water_meter_reading: handover.water_meter_reading || '',
        keys_delivered: handover.keys_delivered || 0,
        keys_description: handover.keys_description || '',
        check_electricity: handover.check_electricity || false,
        check_plumbing: handover.check_plumbing || false,
        check_painting: handover.check_painting || false,
        check_flooring: handover.check_flooring || false,
        check_doors_windows: handover.check_doors_windows || false,
        check_ac: handover.check_ac || false,
        check_kitchen: handover.check_kitchen || false,
        check_bathrooms: handover.check_bathrooms || false,
        warranty_period_months: handover.warranty_period_months || 12,
        warranty_notes: handover.warranty_notes || '',
        notes: handover.notes || '',
        customer_signature_confirmed: handover.customer_signature_confirmed || false,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [handover]);

  const update = (field: keyof UnitHandover, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = { ...formData, user_id: user.id };
      if (handover?.id) {
        const { error } = await supabase.from('unit_handovers').update(data).eq('id', handover.id);
        if (error) throw error;
        toast({ title: "تم تحديث بيانات التسليم بنجاح" });
      } else {
        const { error } = await supabase.from('unit_handovers').insert([data]);
        if (error) throw error;
        toast({ title: "تم إنشاء إقرار التسليم بنجاح" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkItems = [
    { key: 'check_electricity' as const, label: 'الكهرباء والإنارة' },
    { key: 'check_plumbing' as const, label: 'السباكة والصرف' },
    { key: 'check_painting' as const, label: 'الدهانات والتشطيبات' },
    { key: 'check_flooring' as const, label: 'الأرضيات والبلاط' },
    { key: 'check_doors_windows' as const, label: 'الأبواب والنوافذ' },
    { key: 'check_ac' as const, label: 'التكييف والتهوية' },
    { key: 'check_kitchen' as const, label: 'المطبخ' },
    { key: 'check_bathrooms' as const, label: 'دورات المياه' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{handover ? 'تعديل إقرار التسليم' : 'إقرار تسليم وحدة سكنية جديد'}</DialogTitle>
          <DialogDescription>{handover ? 'تعديل بيانات إقرار التسليم' : 'تعبئة بيانات الوحدة السكنية وإقرار الاستلام'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* بيانات المشروع والوحدة */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">بيانات الوحدة السكنية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>اسم المشروع</Label>
                <Input value={formData.project_name} onChange={(e) => update('project_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>اسم المبنى</Label>
                <Input value={formData.building_name} onChange={(e) => update('building_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>رقم الوحدة</Label>
                <Input value={formData.unit_number} onChange={(e) => update('unit_number', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>نوع الوحدة</Label>
                <Select value={formData.unit_type} onValueChange={(v) => update('unit_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شقة">شقة</SelectItem>
                    <SelectItem value="فيلا">فيلا</SelectItem>
                    <SelectItem value="دوبلكس">دوبلكس</SelectItem>
                    <SelectItem value="استوديو">استوديو</SelectItem>
                    <SelectItem value="مكتب">مكتب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الطابق</Label>
                <Input value={formData.floor_number} onChange={(e) => update('floor_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>تاريخ التسليم</Label>
                <Input type="date" value={formData.handover_date} onChange={(e) => update('handover_date', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* بيانات العميل */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">بيانات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input value={formData.customer_name} onChange={(e) => update('customer_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input value={formData.customer_phone} onChange={(e) => update('customer_phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>رقم الهوية</Label>
                <Input value={formData.customer_id_number} onChange={(e) => update('customer_id_number', e.target.value)} />
              </div>
            </div>
          </div>

          {/* قراءات العدادات */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">قراءات العدادات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>قراءة عداد الكهرباء</Label>
                <Input value={formData.electricity_meter_reading} onChange={(e) => update('electricity_meter_reading', e.target.value)} placeholder="مثال: 00125" />
              </div>
              <div className="space-y-2">
                <Label>قراءة عداد الماء</Label>
                <Input value={formData.water_meter_reading} onChange={(e) => update('water_meter_reading', e.target.value)} placeholder="مثال: 00058" />
              </div>
            </div>
          </div>

          {/* المفاتيح */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">المفاتيح المسلمة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عدد المفاتيح</Label>
                <Input type="number" min="0" value={formData.keys_delivered} onChange={(e) => update('keys_delivered', parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>تفاصيل المفاتيح</Label>
                <Input value={formData.keys_description} onChange={(e) => update('keys_description', e.target.value)} placeholder="مفتاح باب رئيسي، مفتاح غرفة..." />
              </div>
            </div>
          </div>

          {/* قائمة الفحص */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">قائمة الفحص والمعاينة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {checkItems.map(item => (
                <div key={item.key} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key]}
                    onCheckedChange={(checked) => update(item.key, !!checked)}
                  />
                  <Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* الضمانات */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">الضمانات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>فترة الضمان (بالأشهر)</Label>
                <Input type="number" min="0" value={formData.warranty_period_months} onChange={(e) => update('warranty_period_months', parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات الضمان</Label>
                <Input value={formData.warranty_notes} onChange={(e) => update('warranty_notes', e.target.value)} />
              </div>
            </div>
          </div>

          {/* الحالة والملاحظات */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">الحالة والملاحظات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>حالة التسليم</Label>
                <Select value={formData.status} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قيد التسليم">قيد التسليم</SelectItem>
                    <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                    <SelectItem value="مرفوض">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse pt-7">
                <Checkbox
                  id="signature"
                  checked={formData.customer_signature_confirmed}
                  onCheckedChange={(checked) => update('customer_signature_confirmed', !!checked)}
                />
                <Label htmlFor="signature" className="cursor-pointer font-semibold">تأكيد توقيع العميل على الاستلام</Label>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>ملاحظات إضافية</Label>
              <Textarea value={formData.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : (handover ? 'تحديث' : 'إنشاء إقرار التسليم')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnitHandoverForm;
