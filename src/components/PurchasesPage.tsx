import React, { useState } from 'react';
import PurchaseForm from '@/components/forms/PurchaseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart, CheckCircle, Clock, AlertCircle, Trash2, Edit, Printer } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';

const PurchasesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const { purchases, isLoading, deletePurchase } = usePurchases();

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
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html dir="rtl">
                                  <head>
                                    <title>طلب شراء ${order.order_number}</title>
                                    <style>
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      body { 
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                        direction: rtl; 
                                        text-align: right; 
                                        margin: 20px;
                                        background: #fff;
                                        color: #333;
                                      }
                                       .header { 
                                         background: linear-gradient(135deg, #f59e0b, #d97706);
                                         color: white; 
                                         padding: 30px; 
                                         border-radius: 10px;
                                         margin-bottom: 30px;
                                         text-align: center;
                                         position: relative;
                                       }
                                       .header .logo-section { 
                                         display: flex; 
                                         align-items: center; 
                                         justify-content: space-between; 
                                         margin-bottom: 20px; 
                                       }
                                       .header .logo { height: 60px; object-fit: contain; }
                                       .header h1 { font-size: 28px; margin-bottom: 10px; }
                                       .header p { font-size: 14px; opacity: 0.9; }
                                      .content { 
                                        background: #f8fafc; 
                                        padding: 30px; 
                                        border-radius: 10px;
                                        border: 2px solid #e2e8f0;
                                      }
                                      .purchase-info { 
                                        display: grid; 
                                        grid-template-columns: 1fr 1fr; 
                                        gap: 20px; 
                                        margin-bottom: 25px;
                                      }
                                      .info-item { 
                                        background: white; 
                                        padding: 15px; 
                                        border-radius: 8px;
                                        border-right: 4px solid #f59e0b;
                                      }
                                      .info-label { 
                                        font-size: 12px; 
                                        color: #64748b; 
                                        font-weight: 600;
                                        margin-bottom: 5px;
                                      }
                                      .info-value { 
                                        font-size: 16px; 
                                        font-weight: bold; 
                                        color: #1e293b;
                                      }
                                      .amount-section { 
                                        background: linear-gradient(135deg, #dc2626, #b91c1c);
                                        color: white; 
                                        padding: 20px; 
                                        border-radius: 10px;
                                        text-align: center;
                                        margin: 25px 0;
                                      }
                                      .amount-section .amount { 
                                        font-size: 24px; 
                                        font-weight: bold; 
                                        margin-bottom: 5px;
                                      }
                                      .status-section { 
                                        display: grid; 
                                        grid-template-columns: 1fr 1fr; 
                                        gap: 15px; 
                                        margin: 20px 0;
                                      }
                                      .status-item { 
                                        background: white; 
                                        padding: 15px; 
                                        border-radius: 8px;
                                        text-align: center;
                                        border: 2px solid #e2e8f0;
                                      }
                                      .status { 
                                        display: inline-block; 
                                        padding: 8px 16px; 
                                        border-radius: 20px; 
                                        font-size: 14px; 
                                        font-weight: bold;
                                        background: ${order.status === 'معتمد' ? '#dcfce7' : order.status === 'في انتظار الموافقة' ? '#fef3c7' : '#fee2e2'};
                                        color: ${order.status === 'معتمد' ? '#166534' : order.status === 'في انتظار الموافقة' ? '#92400e' : '#dc2626'};
                                      }
                                      .delivery-status { 
                                        display: inline-block; 
                                        padding: 8px 16px; 
                                        border-radius: 20px; 
                                        font-size: 14px; 
                                        font-weight: bold;
                                        background: ${order.delivery_status === 'تم التسليم' ? '#dcfce7' : order.delivery_status === 'قيد التجهيز' ? '#dbeafe' : '#f1f5f9'};
                                        color: ${order.delivery_status === 'تم التسليم' ? '#166534' : order.delivery_status === 'قيد التجهيز' ? '#1e40af' : '#475569'};
                                      }
                                      .footer { 
                                        text-align: center; 
                                        margin-top: 30px; 
                                        padding: 20px;
                                        border-top: 2px dashed #cbd5e1;
                                        color: #64748b;
                                        font-size: 12px;
                                      }
                                      @media print { 
                                        body { margin: 0; } 
                                        .header { background: #f59e0b !important; }
                                      }
                                    </style>
                                  </head>
                                   <body>
                                     <div class="header">
                                       <div class="logo-section">
                                         <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="شعار الشركة" class="logo" />
                                         <div></div>
                                       </div>
                                       <h1>🛒 طلب شراء</h1>
                                       <p>نظام إدارة المشتريات</p>
                                     </div>
                                    
                                    <div class="content">
                                      <div class="purchase-info">
                                        <div class="info-item">
                                          <div class="info-label">رقم الطلب</div>
                                          <div class="info-value">${order.order_number}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">اسم المورد</div>
                                          <div class="info-value">${order.supplier_name}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">المشروع</div>
                                          <div class="info-value">${order.project_name}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">طالب الشراء</div>
                                          <div class="info-value">${order.requested_by}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">تاريخ الطلب</div>
                                          <div class="info-value">${order.order_date}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">تاريخ التسليم المتوقع</div>
                                          <div class="info-value">${order.expected_delivery}</div>
                                        </div>
                                      </div>
                                      
                                      <div class="amount-section">
                                        <div class="info-label" style="color: rgba(255,255,255,0.8); margin-bottom: 10px;">المبلغ الإجمالي</div>
                                        <div class="amount">${order.total_amount.toLocaleString()} ريال سعودي</div>
                                      </div>
                                      
                                      <div class="status-section">
                                        <div class="status-item">
                                          <div class="info-label">حالة الموافقة</div>
                                          <div class="info-value">
                                            <span class="status">${order.status}</span>
                                          </div>
                                        </div>
                                        <div class="status-item">
                                          <div class="info-label">حالة التسليم</div>
                                          <div class="info-value">
                                            <span class="delivery-status">${order.delivery_status}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      ${order.approved_by ? `
                                        <div class="info-item" style="margin-top: 20px;">
                                          <div class="info-label">المعتمد من</div>
                                          <div class="info-value">${order.approved_by}</div>
                                        </div>
                                      ` : ''}
                                    </div>
                                    
                                    <div class="footer">
                                      <p>📅 تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
                                      <p>🏢 شركة رافع للتطوير العقاري</p>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deletePurchase.mutate(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
        onSuccess={() => {
          setShowForm(false);
          setEditingPurchase(null);
        }}
      />
    </div>
  );
};

export default PurchasesPage;