import React, { useState, useEffect } from 'react';
import SupplierForm from '@/components/forms/SupplierForm';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Truck, FileText, DollarSign, Calendar, Trash2, Edit, Printer } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [supplierStats, setSupplierStats] = useState<any>({});
  const { suppliers, isLoading, deleteSupplier } = useSuppliers();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInvoicesData();
    }
  }, [user, suppliers]);

  const fetchInvoicesData = async () => {
    try {
      // جلب بيانات الفواتير
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

      // حساب إحصائيات كل مورد
      const stats: any = {};
      
      for (const supplier of suppliers) {
        const supplierInvoices = invoicesData?.filter(invoice => 
          invoice.supplier_name?.trim() === supplier.name?.trim()
        ) || [];

        const totalPurchases = supplierInvoices.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
        const outstandingBalance = supplierInvoices
          .filter(invoice => invoice.status === 'غير مدفوع' || invoice.status === 'متأخر')
          .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);

        stats[supplier.id] = {
          totalPurchases,
          outstandingBalance,
          paymentTerms: '30 يوم', // يمكن إضافة هذا لاحقاً للموردين
          rating: 'ممتاز' // يمكن إضافة نظام تقييم لاحقاً
        };
      }

      setSupplierStats(stats);
    } catch (error) {
      console.error('Error fetching invoices data:', error);
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

  // تصفية الموردين حسب البحث
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'نشط').length;
  const totalPurchases = Object.values(supplierStats).reduce((sum: number, stats: any) => sum + Number(stats.totalPurchases || 0), 0);
  const totalOutstandingBalance = Object.values(supplierStats).reduce((sum: number, stats: any) => sum + Number(stats.outstandingBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الموردون والفواتير</h1>
          <p className="text-gray-600 mt-2">إدارة الموردين ومتابعة الفواتير والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مورد
          </Button>
          <Button variant="outline" onClick={() => setShowInvoiceForm(true)}>
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
            <div className="text-2xl font-bold">{Number(totalPurchases) > 0 ? (Number(totalPurchases) / 1000000).toFixed(1) + 'م' : '0'}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المستحق</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(totalOutstandingBalance) > 0 ? (Number(totalOutstandingBalance) / 1000000).toFixed(1) + 'م' : '0'}</div>
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
            <Button variant="outline" onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "اسم المورد,الفئة,الشخص المسؤول,الهاتف,الحالة\n" +
                filteredSuppliers.map(supplier => 
                  `${supplier.name},${supplier.category || ''},${supplier.company || ''},${supplier.phone || ''},${supplier.status}`
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "suppliers.csv");
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
                  <TableHead className="text-right">اسم المورد</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">الشخص المسؤول</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">إجمالي المشتريات</TableHead>
                  <TableHead className="text-right">الرصيد المستحق</TableHead>
                  <TableHead className="text-right">شروط الدفع</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell>{supplier.company}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{(supplierStats[supplier.id]?.totalPurchases || 0).toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-red-600">{(supplierStats[supplier.id]?.outstandingBalance || 0).toLocaleString()} ر.س</TableCell>
                    <TableCell>{supplierStats[supplier.id]?.paymentTerms || '30 يوم'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplierStats[supplier.id]?.rating || 'ممتاز'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSupplier.mutate(supplier.id)}
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

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير الحديثة</CardTitle>
          <CardDescription>آخر الفواتير الواردة من الموردين</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">اسم المورد</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">تاريخ الإصدار</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.supplier_name}</TableCell>
                      <TableCell>{Number(invoice.amount).toLocaleString()} ر.س</TableCell>
                      <TableCell>{invoice.invoice_date}</TableCell>
                      <TableCell>{invoice.due_date}</TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد فواتير حديثة</p>
              <p className="text-xs mt-1">سيتم عرض الفواتير عند إضافتها</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSuccess={() => {
          setShowForm(false);
          setEditingSupplier(null);
        }}
      />

      <InvoiceForm
        open={showInvoiceForm}
        onOpenChange={setShowInvoiceForm}
        onSuccess={() => {
          setShowInvoiceForm(false);
          // Refresh data if needed
        }}
      />
    </div>
  );
};

export default SuppliersPage;