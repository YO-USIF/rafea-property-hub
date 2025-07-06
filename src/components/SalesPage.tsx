import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Home, Users, DollarSign, Calendar } from 'lucide-react';

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const apartmentSales = [
    {
      id: 1,
      projectName: 'مجمع النخيل السكني',
      unitNumber: 'شقة 205',
      unitType: '3 غرف + صالة',
      area: 120,
      price: 450000,
      customerName: 'أحمد محمد العلي',
      customerPhone: '0501234567',
      status: 'مباع',
      saleDate: '2024-01-15',
      installmentPlan: 'نقدي',
      remainingAmount: 0
    },
    {
      id: 2,
      projectName: 'برج الياسمين التجاري',
      unitNumber: 'مكتب 101',
      unitType: 'مكتب إداري',
      area: 85,
      price: 280000,
      customerName: 'شركة الأعمال المتقدمة',
      customerPhone: '0507654321',
      status: 'محجوز',
      saleDate: '2024-01-10',
      installmentPlan: 'أقساط',
      remainingAmount: 140000
    },
    {
      id: 3,
      projectName: 'مجمع الورود السكني',
      unitNumber: 'شقة 302',
      unitType: '2 غرفة + صالة',
      area: 95,
      price: 380000,
      customerName: 'فاطمة سعد الغامدي',
      customerPhone: '0509876543',
      status: 'متاح',
      saleDate: null,
      installmentPlan: null,
      remainingAmount: 380000
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مباع':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مباع</Badge>;
      case 'محجوز':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">محجوز</Badge>;
      case 'متاح':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">متاح</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalUnits = apartmentSales.length;
  const soldUnits = apartmentSales.filter(unit => unit.status === 'مباع').length;
  const reservedUnits = apartmentSales.filter(unit => unit.status === 'محجوز').length;
  const totalRevenue = apartmentSales
    .filter(unit => unit.status === 'مباع')
    .reduce((sum, unit) => sum + unit.price, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مبيعات الشقق</h1>
          <p className="text-gray-600 mt-2">إدارة مبيعات الشقق والعقود والعملاء</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 ml-2" />
          إضافة عملية بيع
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوحدات</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">وحدة سكنية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المباعة</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{soldUnits}</div>
            <p className="text-xs text-muted-foreground">وحدة مباعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحجوزة</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reservedUnits}</div>
            <p className="text-xs text-muted-foreground">وحدة محجوزة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(1)}م</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات</CardTitle>
          <CardDescription>قائمة جميع الوحدات السكنية وحالة بيعها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المبيعات..."
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
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">رقم الوحدة</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المساحة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبلغ المتبقي</TableHead>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartmentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.projectName}</TableCell>
                    <TableCell>{sale.unitNumber}</TableCell>
                    <TableCell>{sale.unitType}</TableCell>
                    <TableCell>{sale.area} م²</TableCell>
                    <TableCell>{sale.price.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>
                      {sale.remainingAmount > 0 ? `${sale.remainingAmount.toLocaleString()} ر.س` : 'مسدد بالكامل'}
                    </TableCell>
                    <TableCell>{sale.saleDate || 'غير محدد'}</TableCell>
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

export default SalesPage;