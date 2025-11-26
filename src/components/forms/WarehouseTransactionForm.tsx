import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [isManualAmount, setIsManualAmount] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // For steel items, allow manual amount entry
    if (selectedItem?.category === "حديد") {
      setIsManualAmount(true);
    } else {
      setIsManualAmount(false);
      const total = (formData.quantity || 0) * (formData.unit_price || 0);
      setFormData(prev => ({ ...prev, total_amount: total }));
    }
  }, [formData.quantity, formData.unit_price, selectedItem]);

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formData.inventory_item_id
                  ? (() => {
                      const item = inventory.find((i) => i.id === formData.inventory_item_id);
                      return item ? `${item.item_name} (${item.item_code})` : "اختر الصنف";
                    })()
                  : "ابحث عن الصنف..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="ابحث بالاسم أو الكود..." />
                <CommandList>
                  <CommandEmpty>لا توجد نتائج</CommandEmpty>
                  <CommandGroup>
                    {inventory.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.item_name} ${item.item_code}`}
                        onSelect={() => {
                          setFormData({ ...formData, inventory_item_id: item.id });
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.inventory_item_id === item.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{item.item_name} ({item.item_code})</span>
                          <span className="text-xs text-muted-foreground">
                            الكمية المتاحة: {item.current_quantity} {item.unit}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
          <Label htmlFor="total_amount">
            الإجمالي (ريال) {isManualAmount && "*"}
          </Label>
          <Input
            id="total_amount"
            type="number"
            value={formData.total_amount}
            onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
            disabled={!isManualAmount}
            className={!isManualAmount ? "bg-muted" : ""}
            min="0"
            step="0.01"
          />
          {isManualAmount && (
            <p className="text-sm text-blue-600">
              💡 للحديد: أدخل المبلغ الإجمالي يدوياً
            </p>
          )}
          {!isManualAmount && (
            <p className="text-sm text-muted-foreground">
              يتم الحساب تلقائياً (الكمية × السعر)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_name">المشروع (اختياري)</Label>
          <Input
            id="project_name"
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData({ ...formData, project_name: e.target.value, project_id: "" })}
            placeholder="اكتب اسم المشروع"
            maxLength={200}
          />
          {errors.project_name && <p className="text-sm text-destructive">{errors.project_name}</p>}
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
