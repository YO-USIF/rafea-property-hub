import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Truck, FileText, DollarSign, Calendar } from 'lucide-react';

const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    {
      id: 1,
      name: 'شركة مواد البناء المتحدة',
      category: 'مواد بناء',
      contactPerson: 'خالد العتيبي',
      phone: '0501234567',
      email: 'info@united-materials.com',
      address: 'الرياض - طريق الخرج',
      totalPurchases: 850000,
      outstandingBalance: 120000,
      paymentTerms: '30 يوم',
      rating: 4.7,
      status: 'نشط'
    },
    {
      id: 2,
      name: 'مؤسسة الأدوات الكهربائية',
      category: 'أدوات كهربائية',
      contactPerson: 'سعد المطيري',
      phone: '0507654321',
      email: 'sales@electrical-tools.com',
      address: 'جدة - شارع فلسطين',
      totalPurchases: 450000,
      outstandingBalance: 75000,
      paymentTerms: '15 يوم',
      rating: 4.3,
      status: 'نشط'
    },
    {
      id: 3,
      name: 'شركة الحديد والصلب',
      category: 'حديد وصلب',
      contactPerson: 'محمد الغامدي',
      phone: '0509876543',
      email: 'orders@steel-company.com',
      address: 'الدمام - المنطقة الصناعية',
      totalPurchases: 1200000,
      outstandingBalance: 0,
      paymentTerms: '45 يوم',
      rating: 4.9,
      status: 'نشط'
    }
  ];

  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      supplierName: 'شركة مواد البناء المتحدة',
      amount: 185000,
      description: 'أسمنت وحديد تسليح',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      paymentDate: null,
      status: 'مستحق'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      supplierName: 'مؤسسة الأدوات الكهربائية',
      amount: 75000,
      description: 'كابلات وأدوات كهربائية',
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      paymentDate: '2024-01-24',
      status: 'مدفوع'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      supplierName: 'شركة الحديد والصلب',
      amount: 320000,
      description: 'حديد تسليح مختلف الأقطار',
      issueDate: '2024-01-12',
      dueDate: '2024-02-26',
      paymentDate: null,
      status: 'قيد المراجعة'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'نشط':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نشط</Badge>;
      case 'غير نشط':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">غير نشط</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'مدفوع':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مدفوع</Badge>;
      case 'مستحق':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">مستحق</Badge>;
      case 'قيد المراجعة':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">قيد المراجعة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'نشط').length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الموردون والفواتير</h1>
          <p className="text-gray-600 mt-2">إدارة الموردين ومتابعة الفواتير والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مورد
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 ml-2" />
            إضافة فاتورة
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">مورد مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموردين النشطين</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">مورد نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPurchases / 1000000).toFixed(1)}م</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المستحق</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>جميع الموردين المسجلين وبياناتهم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الموردين..."
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
                  <TableHead className="text-right">اسم المورد</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">الشخص المسؤول</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">إجمالي المشتريات</TableHead>
                  <TableHead className="text-right">الرصيد المستحق</TableHead>
                  <TableHead className="text-right">شروط الدفع</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.totalPurchases.toLocaleString()} ر.س</TableCell>
                    <TableCell>{supplier.outstandingBalance.toLocaleString()} ر.س</TableCell>
                    <TableCell>{supplier.paymentTerms}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{supplier.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير الحديثة</CardTitle>
          <CardDescription>آخر الفواتير الواردة من الموردين</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">المورد</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">تاريخ الإصدار</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.supplierName}</TableCell>
                    <TableCell>{invoice.amount.toLocaleString()} ر.س</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersPage;