import React, { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/PermissionButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { usePurchases } from '@/hooks/usePurchases';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { printInvoice } from '@/lib/purchasePrint';

const InvoicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);
  
  const { invoices, isLoading, deleteInvoice } = useInvoices();
  const { purchases } = usePurchases();
  const { toast } = useToast();

  const getOrderNumber = (purchaseId: string) =>
    purchases.find((p: any) => p.id === purchaseId)?.order_number || '—';

  // تصفية الفواتير حسب البحث والحالة
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'الكل' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'مدفوع').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'غير مدفوع').length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await deleteInvoice.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handlePrint = () => {
    const printContent = `
      تقرير الفواتير
      ================
      
      إجمالي الفواتير: ${totalInvoices}
      الفواتير المدفوعة: ${paidInvoices}
      الفواتير غير المدفوعة: ${unpaidInvoices}
      إجمالي المبلغ: ${formatCurrency(totalAmount)}
      
      تفاصيل الفواتير:
      ${filteredInvoices.map(invoice => `
        رقم الفاتورة: ${invoice.invoice_number}
        المورد: ${invoice.supplier_name}
        المبلغ: ${formatCurrency(invoice.amount)}
        الحالة: ${invoice.status}
        التاريخ: ${invoice.invoice_date}
      `).join('\n')}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>تقرير الفواتير</title>
            <style>
              body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
              .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
              .logo { height: 60px; object-fit: contain; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="شعار الشركة" class="logo" />
              <h1>تقرير الفواتير</h1>
            </div>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToCSV = () => {
    const headers = ['رقم الفاتورة', 'المورد', 'المبلغ', 'الحالة', 'تاريخ الفاتورة', 'تاريخ الاستحقاق', 'الوصف'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.supplier_name,
        invoice.amount,
        invoice.status,
        invoice.invoice_date,
        invoice.due_date,
        invoice.description || ''
      ].join(','))
    ].join('\n');

    // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoices.csv';
    link.click();
    
    toast({ title: "تم التصدير", description: "تم تصدير بيانات الفواتير بنجاح" });
  };

  const quickStats = [
    {
      title: 'إجمالي الفواتير',
      value: totalInvoices,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'فواتير مدفوعة',
      value: paidInvoices,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'فواتير غير مدفوعة',
      value: unpaidInvoices,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'إجمالي المبلغ',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'مدفوع': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'غير مدفوع': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'متأخر': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'ملغي': { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['غير مدفوع'];
    return <Badge className={config.color}>{status}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جارٍ التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الفواتير</h1>
          <p className="text-gray-600 mt-2">متابعة وإدارة فواتير الموردين</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button onClick={() => {
            setSelectedInvoice(null);
            setShowInvoiceForm(true);
          }}>
            <Plus className="w-4 h-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الفواتير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحالة</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="الكل">الكل</option>
                    <option value="مدفوع">مدفوع</option>
                    <option value="غير مدفوع">غير مدفوع</option>
                    <option value="متأخر">متأخر</option>
                    <option value="ملغي">ملغي</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStatusFilter('الكل');
                      setSearchQuery('');
                    }}
                  >
                    إزالة التصفية
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>جميع الفواتير المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الفاتورة</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {invoice.purchase_id ? (
                        <Badge variant="outline" className="font-normal">
                          {getOrderNumber(invoice.purchase_id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{invoice.supplier_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={invoice.description || '-'}>{invoice.description || '-'}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{invoice.invoice_date}</TableCell>
                    <TableCell>{invoice.due_date}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printInvoice(invoice, invoice.purchase_id ? purchases.find((p: any) => p.id === invoice.purchase_id) : undefined)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <PermissionButton
                          pageName="invoices"
                          requirePermission="delete"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </PermissionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد فواتير مسجلة'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceForm
        open={showInvoiceForm}
        onOpenChange={setShowInvoiceForm}
        invoice={selectedInvoice}
        onSuccess={() => {
          setShowInvoiceForm(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};

export default InvoicesPage;