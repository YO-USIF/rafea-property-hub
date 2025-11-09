import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const inventoryItemSchema = z.object({
  item_name: z.string().trim().min(1, "اسم الصنف مطلوب").max(200, "اسم الصنف يجب أن يكون أقل من 200 حرف"),
  item_code: z.string().trim().min(1, "كود الصنف مطلوب").max(50, "كود الصنف يجب أن يكون أقل من 50 حرف"),
  category: z.string().min(1, "التصنيف مطلوب"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  minimum_quantity: z.number().min(0, "الحد الأدنى يجب أن يكون صفر أو أكثر"),
  unit_price: z.number().min(0, "سعر الوحدة يجب أن يكون صفر أو أكثر"),
  location: z.string().trim().max(200, "الموقع يجب أن يكون أقل من 200 حرف").optional(),
  description: z.string().trim().max(500, "الوصف يجب أن يكون أقل من 500 حرف").optional(),
});

interface InventoryItemFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export const InventoryItemForm = ({ onSubmit, initialData, onCancel }: InventoryItemFormProps) => {
  const [formData, setFormData] = useState({
    item_name: initialData?.item_name || "",
    item_code: initialData?.item_code || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "",
    minimum_quantity: initialData?.minimum_quantity || 0,
    unit_price: initialData?.unit_price || 0,
    location: initialData?.location || "",
    description: initialData?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = inventoryItemSchema.parse({
        ...formData,
        minimum_quantity: Number(formData.minimum_quantity),
        unit_price: Number(formData.unit_price),
      });
      
      setErrors({});
      onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item_name">اسم الصنف *</Label>
          <Input
            id="item_name"
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            placeholder="أدخل اسم الصنف"
            maxLength={200}
          />
          {errors.item_name && <p className="text-sm text-destructive">{errors.item_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_code">كود الصنف *</Label>
          <Input
            id="item_code"
            value={formData.item_code}
            onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
            placeholder="أدخل كود الصنف"
            maxLength={50}
            disabled={!!initialData}
          />
          {errors.item_code && <p className="text-sm text-destructive">{errors.item_code}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">التصنيف *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category">
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="مواد بناء">مواد بناء</SelectItem>
              <SelectItem value="كهرباء">كهرباء</SelectItem>
              <SelectItem value="سباكة">سباكة</SelectItem>
              <SelectItem value="تشطيبات">تشطيبات</SelectItem>
              <SelectItem value="معدات">معدات</SelectItem>
              <SelectItem value="أدوات">أدوات</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">الوحدة *</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
            <SelectTrigger id="unit">
              <SelectValue placeholder="اختر الوحدة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="متر">متر</SelectItem>
              <SelectItem value="متر مربع">متر مربع</SelectItem>
              <SelectItem value="كيلوجرام">كيلوجرام</SelectItem>
              <SelectItem value="طن">طن</SelectItem>
              <SelectItem value="قطعة">قطعة</SelectItem>
              <SelectItem value="كرتون">كرتون</SelectItem>
              <SelectItem value="لتر">لتر</SelectItem>
              <SelectItem value="عبوة">عبوة</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimum_quantity">الحد الأدنى للكمية</Label>
          <Input
            id="minimum_quantity"
            type="number"
            value={formData.minimum_quantity}
            onChange={(e) => setFormData({ ...formData, minimum_quantity: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
          />
          {errors.minimum_quantity && <p className="text-sm text-destructive">{errors.minimum_quantity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">سعر الوحدة (ريال)</Label>
          <Input
            id="unit_price"
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
          />
          {errors.unit_price && <p className="text-sm text-destructive">{errors.unit_price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">الموقع في المستودع</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="مثال: رف A - صف 3"
            maxLength={200}
          />
          {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف تفصيلي للصنف"
          maxLength={500}
          rows={3}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit">
          {initialData ? "تحديث" : "إضافة"}
        </Button>
      </div>
    </form>
  );
};
