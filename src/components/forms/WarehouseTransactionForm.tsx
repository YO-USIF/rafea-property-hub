import { useState, useEffect } from "react";
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
import { useWarehouse } from "@/hooks/useWarehouse";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const transactionSchema = z.object({
  inventory_item_id: z.string().min(1, "الصنف مطلوب"),
  transaction_type: z.enum(["دخول", "خروج"], { required_error: "نوع الحركة مطلوب" }),
  quantity: z.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unit_price: z.number().min(0, "السعر يجب أن يكون صفر أو أكثر"),
  transaction_date: z.string().min(1, "تاريخ الحركة مطلوب"),
  reference_number: z.string().trim().min(1, "رقم المرجع مطلوب").max(100, "رقم المرجع يجب أن يكون أقل من 100 حرف"),
  project_id: z.string().optional(),
  project_name: z.string().trim().max(200, "اسم المشروع يجب أن يكون أقل من 200 حرف").optional(),
  notes: z.string().trim().max(500, "الملاحظات يجب أن تكون أقل من 500 حرف").optional(),
});

interface WarehouseTransactionFormProps {
  onSubmit: (data: any) => void;
  transactionType: "دخول" | "خروج";
  onCancel?: () => void;
}

export const WarehouseTransactionForm = ({ onSubmit, transactionType, onCancel }: WarehouseTransactionFormProps) => {
  const { inventory } = useWarehouse();
  const { projects } = useProjects();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    inventory_item_id: "",
    transaction_type: transactionType,
    quantity: 0,
    unit_price: 0,
    total_amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: `${transactionType === "دخول" ? "IN" : "OUT"}-${Date.now()}`,
    project_id: "",
    project_name: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const total = (formData.quantity || 0) * (formData.unit_price || 0);
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [formData.quantity, formData.unit_price]);

  useEffect(() => {
    if (formData.inventory_item_id) {
      const item = inventory.find(i => i.id === formData.inventory_item_id);
      setSelectedItem(item);
      if (item) {
        setFormData(prev => ({ ...prev, unit_price: item.unit_price }));
      }
    }
  }, [formData.inventory_item_id, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = transactionSchema.parse({
        ...formData,
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
      });
      
      setErrors({});
      onSubmit({
        ...validated,
        total_amount: formData.total_amount,
        created_by_name: user?.email || "مستخدم",
      });
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
          <Label htmlFor="inventory_item_id">الصنف *</Label>
          <Select 
            value={formData.inventory_item_id} 
            onValueChange={(value) => setFormData({ ...formData, inventory_item_id: value })}
          >
            <SelectTrigger id="inventory_item_id">
              <SelectValue placeholder="اختر الصنف" />
            </SelectTrigger>
            <SelectContent>
              {inventory.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.item_name} ({item.item_code}) - الكمية المتاحة: {item.current_quantity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.inventory_item_id && <p className="text-sm text-destructive">{errors.inventory_item_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference_number">رقم المرجع *</Label>
          <Input
            id="reference_number"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            placeholder="رقم الفاتورة أو الأمر"
            maxLength={100}
          />
          {errors.reference_number && <p className="text-sm text-destructive">{errors.reference_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">الكمية *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            min="0.01"
            step="0.01"
          />
          {selectedItem && (
            <p className="text-sm text-muted-foreground">
              الكمية المتاحة: {selectedItem.current_quantity} {selectedItem.unit}
            </p>
          )}
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">سعر الوحدة (ريال) *</Label>
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
          <Label htmlFor="transaction_date">تاريخ الحركة *</Label>
          <Input
            id="transaction_date"
            type="date"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
          />
          {errors.transaction_date && <p className="text-sm text-destructive">{errors.transaction_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_amount">الإجمالي (ريال)</Label>
          <Input
            id="total_amount"
            type="number"
            value={formData.total_amount.toFixed(2)}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_id">المشروع (اختياري)</Label>
          <Select 
            value={formData.project_id} 
            onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              setFormData({ 
                ...formData, 
                project_id: value,
                project_name: project?.name || ""
              });
            }}
          >
            <SelectTrigger id="project_id">
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">بدون مشروع</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="ملاحظات إضافية"
          maxLength={500}
          rows={3}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit">
          تسجيل الحركة
        </Button>
      </div>
    </form>
  );
};
