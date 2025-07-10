import React, { useState } from 'react';
import SaleForm from '@/components/forms/SaleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Home, Users, DollarSign, Calendar, Trash2, Edit, Printer } from 'lucide-react';
import { useSales } from '@/hooks/useSales';

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const { sales, isLoading, deleteSale } = useSales();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل البيانات...</div>
      </div>
    );
  }

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

  // تصفية المبيعات حسب البحث
  const filteredSales = sales.filter(sale =>
    sale.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.unit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = sales.length;
  const soldUnits = sales.filter(unit => unit.status === 'مباع').length;
  const reservedUnits = sales.filter(unit => unit.status === 'محجوز').length;
  const totalRevenue = sales
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
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowForm(true)}
        >
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
            <Button variant="outline" onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "المشروع,رقم الوحدة,النوع,المساحة,السعر,العميل,الحالة,المبلغ المتبقي,تاريخ البيع\n" +
                filteredSales.map(sale => 
                  `${sale.project_name},${sale.unit_number},${sale.unit_type},${sale.area},${sale.price},${sale.customer_name},${sale.status},${sale.remaining_amount || 0},${sale.sale_date || 'غير محدد'}`
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "sales.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
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
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">رقم الوحدة</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المساحة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبلغ المتبقي</TableHead>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.project_name}</TableCell>
                    <TableCell>{sale.unit_number}</TableCell>
                    <TableCell>{sale.unit_type}</TableCell>
                    <TableCell>{sale.area} م²</TableCell>
                    <TableCell>{sale.price.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.customer_name}</div>
                        <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>
                      {sale.remaining_amount > 0 ? `${sale.remaining_amount.toLocaleString()} ر.س` : 'مسدد بالكامل'}
                    </TableCell>
                    <TableCell>{sale.sale_date || 'غير محدد'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSale(sale);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSale.mutate(sale.id)}
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

      <SaleForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingSale(null);
        }}
        sale={editingSale}
        onSuccess={() => {
          setShowForm(false);
          setEditingSale(null);
        }}
      />
    </div>
  );
};

export default SalesPage;