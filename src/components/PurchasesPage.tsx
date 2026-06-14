import React, { useState } from 'react';

import PurchaseForm from '@/components/forms/PurchaseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/PermissionButton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Search, ShoppingCart, CheckCircle, Clock, AlertCircle, Trash2, Edit, Printer, FileText, Paperclip, Stamp } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/userDisplayNames';
import { printPurchaseOrder } from '@/lib/purchasePrint';

const PurchasesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [attachingOrder, setAttachingOrder] = useState<any>(null);
  const { purchases, isLoading, deletePurchase, updatePurchase } = usePurchases();
  const { invoices, createInvoice } = useInvoices();
  const { toast } = useToast();
  const { user } = useAuth();

  const currentUserName = getDisplayName(user?.email);
  const isAmmar = currentUserName === 'عمار نور الدين';

  const getLinkedInvoices = (purchaseId: string) =>
    invoices.filter((inv: any) => inv.purchase_id === purchaseId);

  // تعميد الطلب (المرحلة الأولى): تحويله إلى "معتمد" وتسجيل المعتمد
  const handleApprove = async (order: any) => {
    setApprovingId(order.id);
    try {
      await updatePurchase.mutateAsync({
        id: order.id,
        status: 'معتمد',
        approved_by: currentUserName,
      });
      toast({ title: 'تم تعميد الطلب', description: `الطلب ${order.order_number} أصبح معتمداً` });
    } catch (error) {
      console.error('Error approving purchase:', error);
      toast({ title: 'خطأ في تعميد الطلب', variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  // حفظ مرفق للطلب
  const handleSaveAttachment = async (fileUrl: string, fileName: string) => {
    if (!attachingOrder) return;
    try {
      await updatePurchase.mutateAsync({
        id: attachingOrder.id,
        attached_file_url: fileUrl,
        attached_file_name: fileName,
      });
      setAttachingOrder((prev: any) =>
        prev ? { ...prev, attached_file_url: fileUrl, attached_file_name: fileName } : prev
      );
      toast({ title: 'تم إرفاق الملف بنجاح' });
    } catch (error) {
      console.error('Error attaching file:', error);
      toast({ title: 'خطأ في إرفاق الملف', variant: 'destructive' });
    }
  };


  const handleConvertToInvoice = async (order: any) => {
    const linkedCount = getLinkedInvoices(order.id).length;

    if (linkedCount > 0) {
      const proceed = window.confirm(
        `يوجد بالفعل ${linkedCount} فاتورة مرتبطة بهذا الطلب. هل تريد إنشاء فاتورة إضافية؟`
      );
      if (!proceed) return;
    }

    const invoiceNumber =
      linkedCount === 0
        ? `INV-${order.order_number}`
        : `INV-${order.order_number}-${linkedCount + 1}`;

    const today = new Date().toISOString().split('T')[0];

    setConvertingId(order.id);
    try {
      await createInvoice.mutateAsync({
        invoice_number: invoiceNumber,
        supplier_name: order.supplier_name,
        project_id: order.project_id || null,
        amount: Number(order.total_amount) || 0,
        description: `فاتورة محوّلة من طلب الشراء رقم ${order.order_number}${order.project_name ? ` - ${order.project_name}` : ''}`,
        invoice_date: today,
        due_date: null,
        status: 'غير مدفوع',
        purchase_id: order.id,
        // المرفق في المشتريات خاص بعروض الأسعار فقط ولا يُنقل للفاتورة
        attached_file_url: '',
        attached_file_name: '',
      });

      // تحديث حالة الطلب إلى "محوّل لفاتورة" للتعميد النهائي
      await updatePurchase.mutateAsync({
        id: order.id,
        status: 'محوّل لفاتورة',
      });
    } catch (error) {
      console.error('Error converting purchase to invoice:', error);
      toast({ title: 'خطأ في تحويل الطلب إلى فاتورة', variant: 'destructive' });
    } finally {
      setConvertingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل البيانات...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'معتمد':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">معتمد</Badge>;
      case 'محوّل لفاتورة':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">محوّل لفاتورة</Badge>;
      case 'في انتظار الموافقة':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">في انتظار الموافقة</Badge>;
      case 'مرفوض':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">مرفوض</Badge>;
      case 'ملغي':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'تم التسليم':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">تم التسليم</Badge>;
      case 'قيد التجهيز':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد التجهيز</Badge>;
      case 'لم يتم التسليم':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">لم يتم التسليم</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // تصفية المشتريات حسب البحث
  const filteredPurchases = purchases.filter(purchase =>
    purchase.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = purchases.length;
  const approvedOrders = purchases.filter(order => order.status === 'معتمد').length;
  const pendingOrders = purchases.filter(order => order.status === 'في انتظار الموافقة').length;
  const totalAmount = purchases
    .filter(order => order.status === 'معتمد')
    .reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المشتريات</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات الشراء والموافقات والتوريد</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          طلب شراء جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">طلب شراء</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المعتمدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedOrders}</div>
            <p className="text-xs text-muted-foreground">طلب معتمد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في انتظار الموافقة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">طلب معلق</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الشراء</CardTitle>
          <CardDescription>جميع طلبات الشراء وحالة معالجتها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في طلبات الشراء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={() => {
              const headers = "رقم الطلب,المورد,المشروع,طالب الشراء,تاريخ الطلب,تاريخ التسليم المتوقع,المبلغ الإجمالي,حالة الموافقة,حالة التسليم\n";
              const csvContent = headers + 
                filteredPurchases.map(order => 
                  `${order.order_number},${order.supplier_name},${order.project_name},${order.requested_by},${order.order_date},${order.expected_delivery},${order.total_amount},${order.status},${order.delivery_status}`
                ).join("\n");
              
              // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
              const BOM = '\uFEFF';
              const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'purchases.csv';
              link.click();
            }}>تصدير</Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">المورد</TableHead>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">طالب الشراء</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">تاريخ التسليم المتوقع</TableHead>
                  <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right">حالة الموافقة</TableHead>
                  <TableHead className="text-right">حالة التسليم</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.supplier_name}</TableCell>
                    <TableCell>{order.project_name}</TableCell>
                    <TableCell>{order.requested_by}</TableCell>
                    <TableCell>{order.order_date}</TableCell>
                    <TableCell>{order.expected_delivery}</TableCell>
                    <TableCell>{order.total_amount.toLocaleString()} ر.س</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getDeliveryStatusBadge(order.delivery_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingPurchase(order);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printPurchaseOrder(order)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {order.status === 'في انتظار الموافقة' && !isAmmar && (
                          <PermissionButton
                            pageName="purchases"
                            requirePermission="edit"
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            disabled={approvingId === order.id}
                            title="تعميد الطلب"
                            onClick={() => handleApprove(order)}
                          >
                            <Stamp className="w-4 h-4 ml-1" />
                            {approvingId === order.id ? 'جارٍ...' : 'تعميد'}
                          </PermissionButton>
                        )}
                        {(order.status === 'معتمد' || order.status === 'محوّل لفاتورة') && (
                          <PermissionButton
                            pageName="purchases"
                            requirePermission="edit"
                            size="sm"
                            variant="outline"
                            className={order.attached_file_url ? 'text-blue-700 border-blue-300 hover:bg-blue-50' : ''}
                            title="إرفاق ملفات"
                            onClick={() => setAttachingOrder(order)}
                          >
                            <Paperclip className="w-4 h-4 ml-1" />
                            {order.attached_file_url ? 'مرفق' : 'إرفاق'}
                          </PermissionButton>
                        )}
                        {(order.status === 'معتمد' || order.status === 'محوّل لفاتورة') && (
                          <PermissionButton
                            pageName="invoices"
                            requirePermission="create"
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={convertingId === order.id}
                            title="تحويل إلى فاتورة"
                            onClick={() => handleConvertToInvoice(order)}
                          >
                            <FileText className="w-4 h-4 ml-1" />
                            {getLinkedInvoices(order.id).length > 0
                              ? `فاتورة (${getLinkedInvoices(order.id).length})`
                              : 'فاتورة'}
                          </PermissionButton>
                        )}
                        <PermissionButton
                          pageName="purchases"
                          requirePermission="delete"
                          size="sm"
                          variant="outline"
                          onClick={() => deletePurchase.mutate(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </PermissionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل آخر طلب شراء</CardTitle>
          <CardDescription>عرض تفاصيل المواد المطلوبة في آخر طلب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">رقم الطلب</p>
                <p className="text-lg font-semibold">{purchases[0]?.order_number || 'لا يوجد'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">المورد</p>
                <p className="text-lg font-semibold">{purchases[0]?.supplier_name || 'لا يوجد'}</p>
              </div>
            </div>
            
            <div className="text-center py-4 text-gray-500">
              <p>تفاصيل المواد ستعرض هنا عند إضافة طلبات شراء</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PurchaseForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingPurchase(null);
        }}
        purchase={editingPurchase}
        currentUserName={currentUserName}
        onSuccess={() => {
          setShowForm(false);
          setEditingPurchase(null);
        }}
      />

      <Dialog
        open={!!attachingOrder}
        onOpenChange={(open) => {
          if (!open) setAttachingOrder(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إرفاق ملفات للطلب {attachingOrder?.order_number}</DialogTitle>
            <DialogDescription>
              ارفع فاتورة المورد أو أي مستندات داعمة لهذا الطلب المعتمد.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            currentFileUrl={attachingOrder?.attached_file_url}
            currentFileName={attachingOrder?.attached_file_name}
            onFileUploaded={handleSaveAttachment}
            onFileRemoved={() => handleSaveAttachment('', '')}
          />
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default PurchasesPage;