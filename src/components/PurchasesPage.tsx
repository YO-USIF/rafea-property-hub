import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const PurchasesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const purchaseOrders = [
    {
      id: 1,
      orderNumber: 'PO-2024-001',
      supplierName: 'شركة مواد البناء المتحدة',
      projectName: 'مجمع النخيل السكني',
      requestedBy: 'المهندس أحمد سالم',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      totalAmount: 185000,
      items: [
        { name: 'أسمنت بورتلاندي', quantity: 100, unit: 'كيس', unitPrice: 45 },
        { name: 'حديد تسليح 16مم', quantity: 50, unit: 'طن', unitPrice: 2800 }
      ],
      status: 'معتمد',
      approvedBy: 'مدير المشتريات',
      deliveryStatus: 'تم التسليم'
    },
    {
      id: 2,
      orderNumber: 'PO-2024-002',
      supplierName: 'مؤسسة الأدوات الكهربائية',
      projectName: 'برج الياسمين التجاري',
      requestedBy: 'فني الكهرباء محمد',
      orderDate: '2024-01-18',
      expectedDelivery: '2024-01-28',
      totalAmount: 75000,
      items: [
        { name: 'كابلات كهربائية 4مم', quantity: 500, unit: 'متر', unitPrice: 12 },
        { name: 'قواطع كهربائية', quantity: 20, unit: 'قطعة', unitPrice: 350 }
      ],
      status: 'في انتظار الموافقة',
      approvedBy: null,
      deliveryStatus: 'لم يتم التسليم'
    },
    {
      id: 3,
      orderNumber: 'PO-2024-003',
      supplierName: 'شركة الحديد والصلب',
      projectName: 'مجمع الورود السكني',
      requestedBy: 'المهندس عبدالله فهد',
      orderDate: '2024-01-20',
      expectedDelivery: '2024-02-05',
      totalAmount: 320000,
      items: [
        { name: 'حديد تسليح 12مم', quantity: 80, unit: 'طن', unitPrice: 2750 },
        { name: 'حديد تسليح 20مم', quantity: 40, unit: 'طن', unitPrice: 2850 }
      ],
      status: 'معتمد',
      approvedBy: 'مدير المشتريات',
      deliveryStatus: 'قيد التجهيز'
    }
  ];

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

  const totalOrders = purchaseOrders.length;
  const approvedOrders = purchaseOrders.filter(order => order.status === 'معتمد').length;
  const pendingOrders = purchaseOrders.filter(order => order.status === 'في انتظار الموافقة').length;
  const totalAmount = purchaseOrders
    .filter(order => order.status === 'معتمد')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المشتريات</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات الشراء والموافقات والتوريد</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
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
            <Button variant="outline">تصفية</Button>
            <Button variant="outline">تصدير</Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{order.projectName}</TableCell>
                    <TableCell>{order.requestedBy}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.expectedDelivery}</TableCell>
                    <TableCell>{order.totalAmount.toLocaleString()} ر.س</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getDeliveryStatusBadge(order.deliveryStatus)}</TableCell>
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
                <p className="text-lg font-semibold">{purchaseOrders[0]?.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">المورد</p>
                <p className="text-lg font-semibold">{purchaseOrders[0]?.supplierName}</p>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المادة</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">الوحدة</TableHead>
                    <TableHead className="text-right">سعر الوحدة</TableHead>
                    <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders[0]?.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.unitPrice} ر.س</TableCell>
                      <TableCell>{(item.quantity * item.unitPrice).toLocaleString()} ر.س</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesPage;