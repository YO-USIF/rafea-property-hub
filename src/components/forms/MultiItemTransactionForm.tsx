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
import { useWarehouse } from "@/hooks/useWarehouse";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionItem {
  id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

interface MultiItemTransactionFormProps {
  onSubmit: (items: any[]) => void;
  transactionType: "دخول" | "خروج";
  onCancel?: () => void;
}

export const MultiItemTransactionForm = ({ 
  onSubmit, 
  transactionType, 
  onCancel 
}: MultiItemTransactionFormProps) => {
  const { inventory } = useWarehouse();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<TransactionItem[]>([{
    id: Math.random().toString(),
    inventory_item_id: "",
    quantity: 0,
    unit_price: 0,
    total_amount: 0,
  }]);
  
  const [commonData, setCommonData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: `${transactionType === "دخول" ? "IN" : "OUT"}-${Date.now()}`,
    project_name: "",
    notes: "",
  });

  const filteredInventory = inventory.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, {
      id: Math.random().toString(),
      inventory_item_id: "",
      quantity: 0,
      unit_price: 0,
      total_amount: 0,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof TransactionItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-select unit price when item is selected
        if (field === "inventory_item_id") {
          const inventoryItem = inventory.find(i => i.id === value);
          if (inventoryItem) {
            updated.unit_price = inventoryItem.unit_price;
          }
        }
        
        // Auto-calculate total for non-steel items
        if (field === "quantity" || field === "unit_price") {
          const inventoryItem = inventory.find(i => i.id === updated.inventory_item_id);
          if (inventoryItem?.category !== "حديد") {
            updated.total_amount = updated.quantity * updated.unit_price;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    const validItems = items.filter(item => 
      item.inventory_item_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      alert("يرجى إضافة صنف واحد على الأقل");
      return;
    }

    const transactions = validItems.map(item => ({
      inventory_item_id: item.inventory_item_id,
      transaction_type: transactionType,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_amount: item.total_amount,
      transaction_date: commonData.transaction_date,
      reference_number: commonData.reference_number,
      project_name: commonData.project_name,
      notes: commonData.notes,
      created_by_name: user?.email || "مستخدم",
    }));

    onSubmit(transactions);
  };

  const getItemInfo = (itemId: string) => {
    return inventory.find(i => i.id === itemId);
  };

  return (
    <div className="space-y-6">
      {/* Common Data Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">البيانات المشتركة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference_number">رقم المرجع *</Label>
              <Input
                id="reference_number"
                value={commonData.reference_number}
                onChange={(e) => setCommonData({ ...commonData, reference_number: e.target.value })}
                placeholder="رقم الفاتورة أو الأمر"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">تاريخ الحركة *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={commonData.transaction_date}
                onChange={(e) => setCommonData({ ...commonData, transaction_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_name">المشروع (اختياري)</Label>
              <Input
                id="project_name"
                value={commonData.project_name}
                onChange={(e) => setCommonData({ ...commonData, project_name: e.target.value })}
                placeholder="اكتب اسم المشروع"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={commonData.notes}
                onChange={(e) => setCommonData({ ...commonData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <div className="space-y-2">
        <Label htmlFor="search">بحث في الأصناف</Label>
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="ابحث بالاسم أو الكود أو التصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">الأصناف</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة صنف
          </Button>
        </div>

        {items.map((item, index) => {
          const itemInfo = getItemInfo(item.inventory_item_id);
          const isSteelItem = itemInfo?.category === "حديد";
          
          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">صنف {index + 1}</Badge>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>الصنف *</Label>
                      <Select 
                        value={item.inventory_item_id} 
                        onValueChange={(value) => updateItem(item.id, "inventory_item_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredInventory.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id}>
                              <div className="flex flex-col">
                                <span>{invItem.item_name} ({invItem.item_code})</span>
                                <span className="text-xs text-muted-foreground">
                                  {invItem.category} - متاح: {invItem.current_quantity} {invItem.unit}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {itemInfo && (
                        <p className="text-sm text-muted-foreground">
                          الكمية المتاحة: {itemInfo.current_quantity} {itemInfo.unit}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>الكمية *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>سعر الوحدة (ريال) *</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>الإجمالي (ريال) {isSteelItem && "*"}</Label>
                      <Input
                        type="number"
                        value={item.total_amount}
                        onChange={(e) => updateItem(item.id, "total_amount", parseFloat(e.target.value) || 0)}
                        disabled={!isSteelItem}
                        className={!isSteelItem ? "bg-muted" : ""}
                        min="0"
                        step="0.01"
                      />
                      {isSteelItem && (
                        <p className="text-sm text-blue-600">
                          💡 للحديد: أدخل المبلغ الإجمالي يدوياً
                        </p>
                      )}
                      {!isSteelItem && (
                        <p className="text-sm text-muted-foreground">
                          يتم الحساب تلقائياً (الكمية × السعر)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">إجمالي القيمة:</span>
            <span className="text-2xl font-bold">
              {items.reduce((sum, item) => sum + (item.total_amount || 0), 0).toLocaleString()} ريال
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="button" onClick={handleSubmit}>
          تسجيل جميع الحركات ({items.filter(i => i.inventory_item_id).length})
        </Button>
      </div>
    </div>
  );
};
