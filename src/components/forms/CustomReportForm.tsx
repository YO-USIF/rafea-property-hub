import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface CustomReport {
  id?: string;
  reportName: string;
  reportType: string;
  dateRange: string;
  customDateFrom?: string;
  customDateTo?: string;
  includeFields: string[];
  description?: string;
}

interface CustomReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CustomReportForm = ({ open, onOpenChange, onSuccess }: CustomReportFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomReport>({
    reportName: '',
    reportType: 'financial',
    dateRange: 'monthly',
    customDateFrom: '',
    customDateTo: '',
    includeFields: [],
    description: ''
  });

  const availableFields = {
    financial: [
      'الإيرادات',
      'المصروفات',
      'الأرباح',
      'المبيعات',
      'المشتريات',
      'الفواتير'
    ],
    projects: [
      'تقدم المشاريع',
      'التكاليف',
      'المدة الزمنية',
      'الوحدات المباعة',
      'معدل الإنجاز'
    ],
    sales: [
      'عدد المبيعات',
      'قيمة المبيعات',
      'العملاء الجدد',
      'معدل التحويل',
      'خطط التقسيط'
    ],
    operations: [
      'المهام المكتملة',
      'طلبات الصيانة',
      'أداء الموظفين',
      'المقاولين',
      'الموردين'
    ]
  };

  const handleFieldChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      includeFields: checked 
        ? [...prev.includeFields, field]
        : prev.includeFields.filter(f => f !== field)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إنشاء التقرير",
        description: "تم إنشاء التقرير المخصص بنجاح وسيتم إرساله إليك قريباً"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير",
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
          <DialogTitle>إنشاء تقرير مخصص</DialogTitle>
          <DialogDescription>
            قم بتخصيص التقرير حسب احتياجاتك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">اسم التقرير</Label>
              <Input
                id="reportName"
                value={formData.reportName}
                onChange={(e) => setFormData(prev => ({ ...prev, reportName: e.target.value }))}
                required
                placeholder="مثال: تقرير مبيعات الربع الأول"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">نوع التقرير</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value, includeFields: [] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">مالي</SelectItem>
                  <SelectItem value="projects">مشاريع</SelectItem>
                  <SelectItem value="sales">مبيعات</SelectItem>
                  <SelectItem value="operations">عمليات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">الفترة الزمنية</Label>
              <Select
                value={formData.dateRange}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customDateFrom">من تاريخ</Label>
                  <Input
                    id="customDateFrom"
                    type="date"
                    value={formData.customDateFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDateFrom: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDateTo">إلى تاريخ</Label>
                  <Input
                    id="customDateTo"
                    type="date"
                    value={formData.customDateTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDateTo: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>الحقول المطلوبة</Label>
            <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg">
              {availableFields[formData.reportType as keyof typeof availableFields]?.map((field) => (
                <div key={field} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={field}
                    checked={formData.includeFields.includes(field)}
                    onCheckedChange={(checked) => handleFieldChange(field, checked as boolean)}
                  />
                  <Label htmlFor={field} className="text-sm">{field}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="أي ملاحظات أو متطلبات خاصة للتقرير"
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء التقرير'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomReportForm;