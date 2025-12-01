import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWarehouse } from "@/hooks/useWarehouse";
import { InventoryItemForm } from "./forms/InventoryItemForm";
import { WarehouseTransactionForm } from "./forms/WarehouseTransactionForm";
import { MultiItemTransactionForm } from "./forms/MultiItemTransactionForm";
import { WarehouseInventoryReport } from "./reports/WarehouseInventoryReport";
import { Plus, Package, TrendingUp, TrendingDown, Edit, Trash2, AlertTriangle, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const WarehousePage = () => {
  const { isManager, isAdmin, loading } = useUserRole();
  const { user } = useAuth();
  const isManagerOrAdmin = isManager || isAdmin;
  
  // التحقق من أن المستخدم هو المدير عمار (صلاحية إضافة فقط)
  const isAmmarManager = user?.email === 'amarnory92@gmail.com';
  const canEditAndDelete = isManagerOrAdmin && !isAmmarManager;
  const {
    inventory,
    transactions,
    isLoadingInventory,
    isLoadingTransactions,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    createTransaction,
    deleteTransaction,
  } = useWarehouse();

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddInOpen, setIsAddInOpen] = useState(false);
  const [isAddOutOpen, setIsAddOutOpen] = useState(false);
  const [isMultiAddInOpen, setIsMultiAddInOpen] = useState(false);
  const [isMultiAddOutOpen, setIsMultiAddOutOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  // حماية الصفحة للمدراء فقط
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // السماح بالوصول للمدراء والمدير عمار
  const hasAccess = isManagerOrAdmin || isAmmarManager;
  
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-muted-foreground">هذه الصفحة متاحة للمدراء فقط</p>
        </div>
      </div>
    );
  }

  const handleAddItem = (data: any) => {
    createInventoryItem.mutate(data, {
      onSuccess: () => setIsAddItemOpen(false),
    });
  };

  const handleUpdateItem = (data: any) => {
    if (editingItem) {
      updateInventoryItem.mutate(
        { id: editingItem.id, ...data },
        {
          onSuccess: () => setEditingItem(null),
        }
      );
    }
  };

  const handleDeleteItem = () => {
    if (deletingItem) {
      deleteInventoryItem.mutate(deletingItem.id, {
        onSuccess: () => setDeletingItem(null),
      });
    }
  };

  const handleAddTransaction = (data: any) => {
    createTransaction.mutate(data, {
      onSuccess: () => {
        setIsAddInOpen(false);
        setIsAddOutOpen(false);
      },
    });
  };

  const handleMultiAddTransaction = async (items: any[]) => {
    try {
      // Process all transactions sequentially
      for (const item of items) {
        await createTransaction.mutateAsync(item);
      }
      setIsMultiAddInOpen(false);
      setIsMultiAddOutOpen(false);
    } catch (error) {
      console.error("Error creating transactions:", error);
    }
  };

  const handleDeleteTransaction = () => {
    if (deletingTransaction) {
      deleteTransaction.mutate(deletingTransaction.id, {
        onSuccess: () => setDeletingTransaction(null),
      });
    }
  };

  const lowStockItems = inventory.filter(
    (item) => item.current_quantity <= item.minimum_quantity
  );

  const totalValue = inventory.reduce(
    (sum, item) => sum + item.current_quantity * item.unit_price,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">المستودع</h1>
          <p className="text-muted-foreground">إدارة المخزون وحركات الدخول والخروج</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">صنف في المستودع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">القيمة الإجمالية</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="transactions">الحركات</TabsTrigger>
          <TabsTrigger value="report">تقرير الأصناف</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {hasAccess && (
            <div className="flex gap-2">
              <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة صنف جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة صنف جديد للمخزون</DialogTitle>
                  </DialogHeader>
                  <InventoryItemForm onSubmit={handleAddItem} onCancel={() => setIsAddItemOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>أصناف المخزون</CardTitle>
              <CardDescription>قائمة بجميع الأصناف المتوفرة في المستودع</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInventory ? (
                <div className="text-center py-8">جارٍ التحميل...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد أصناف في المخزون
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الصنف</TableHead>
                        <TableHead>اسم الصنف</TableHead>
                        <TableHead>التصنيف</TableHead>
                        <TableHead>الكمية الحالية</TableHead>
                        <TableHead>الحد الأدنى</TableHead>
                        <TableHead>الوحدة</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>القيمة</TableHead>
                        <TableHead>الموقع</TableHead>
                        {isManagerOrAdmin && <TableHead>الإجراءات</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item_code}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                item.current_quantity <= item.minimum_quantity
                                  ? "text-destructive font-bold"
                                  : ""
                              }
                            >
                              {item.current_quantity}
                            </span>
                          </TableCell>
                          <TableCell>{item.minimum_quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.unit_price.toLocaleString()} ريال</TableCell>
                          <TableCell>
                            {(item.current_quantity * item.unit_price).toLocaleString()} ريال
                          </TableCell>
                          <TableCell>{item.location || "-"}</TableCell>
                          {isManagerOrAdmin && (
                            <TableCell>
                              {canEditAndDelete ? (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingItem(item)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">عرض فقط</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {hasAccess && (
            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddInOpen} onOpenChange={setIsAddInOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <TrendingUp className="ml-2 h-4 w-4" />
                    دخول صنف واحد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تسجيل دخول بضاعة للمستودع</DialogTitle>
                  </DialogHeader>
                  <WarehouseTransactionForm
                    transactionType="دخول"
                    onSubmit={handleAddTransaction}
                    onCancel={() => setIsAddInOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isMultiAddInOpen} onOpenChange={setIsMultiAddInOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Plus className="ml-2 h-4 w-4" />
                    دخول عدة أصناف
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تسجيل دخول عدة أصناف للمستودع</DialogTitle>
                  </DialogHeader>
                  <MultiItemTransactionForm
                    transactionType="دخول"
                    onSubmit={handleMultiAddTransaction}
                    onCancel={() => setIsMultiAddInOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isAddOutOpen} onOpenChange={setIsAddOutOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <TrendingDown className="ml-2 h-4 w-4" />
                    خروج صنف واحد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تسجيل خروج بضاعة من المستودع</DialogTitle>
                  </DialogHeader>
                  <WarehouseTransactionForm
                    transactionType="خروج"
                    onSubmit={handleAddTransaction}
                    onCancel={() => setIsAddOutOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isMultiAddOutOpen} onOpenChange={setIsMultiAddOutOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="ml-2 h-4 w-4" />
                    خروج عدة أصناف
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تسجيل خروج عدة أصناف من المستودع</DialogTitle>
                  </DialogHeader>
                  <MultiItemTransactionForm
                    transactionType="خروج"
                    onSubmit={handleMultiAddTransaction}
                    onCancel={() => setIsMultiAddOutOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>حركات المستودع</CardTitle>
              <CardDescription>سجل حركات الدخول والخروج</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="text-center py-8">جارٍ التحميل...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد حركات مسجلة
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الصنف</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>المشروع</TableHead>
                        <TableHead>رقم المرجع</TableHead>
                        {isManagerOrAdmin && <TableHead>الإجراءات</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.transaction_date).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.transaction_type === "دخول" ? "default" : "secondary"}
                            >
                              {transaction.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.warehouse_inventory?.item_name || "-"}
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.unit_price.toLocaleString()} ريال</TableCell>
                          <TableCell>{transaction.total_amount.toLocaleString()} ريال</TableCell>
                          <TableCell>{transaction.project_name || "-"}</TableCell>
                          <TableCell>{transaction.reference_number}</TableCell>
                          {isManagerOrAdmin && (
                            <TableCell>
                              {canEditAndDelete ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingTransaction(transaction)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">عرض فقط</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <WarehouseInventoryReport />
        </TabsContent>
      </Tabs>

      {lowStockItems.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تنبيه: أصناف تحتاج إعادة طلب
            </CardTitle>
            <CardDescription>
              الأصناف التالية وصلت للحد الأدنى أو أقل ويجب إعادة طلبها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-sm text-muted-foreground">
                      كود: {item.item_code} | التصنيف: {item.category}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm">
                      <span className="font-bold text-destructive">{item.current_quantity}</span>
                      <span className="text-muted-foreground"> / {item.minimum_quantity}</span>
                      <span className="text-muted-foreground"> {item.unit}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.location || "بدون موقع محدد"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الصنف</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <InventoryItemForm
              initialData={editingItem}
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الصنف "{deletingItem?.item_name}"؟ سيتم حذف جميع الحركات المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الحركة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center text-sm text-muted-foreground pb-4">
        شركة سهيل طيبة للتطوير العقاري © 2024
      </div>
    </div>
  );
};
