import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import InvoiceForm from '@/components/forms/InvoiceForm';

const InvoicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);
  
  const { invoices, isLoading, deleteInvoice } = useInvoices();
  const { toast } = useToast();

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
            console.log('=== OPENING INVOICE FORM ===');
            setSelectedInvoice(null);
            setShowInvoiceForm(true);
            console.log('Show invoice form state:', true);
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
                <TableHead>المورد</TableHead>
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
                    <TableCell>{invoice.supplier_name}</TableCell>
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
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html dir="rtl">
                                  <head>
                                    <title>فاتورة ${invoice.invoice_number}</title>
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
                                        background: linear-gradient(135deg, #4f46e5, #7c3aed);
                                        color: white; 
                                        padding: 30px; 
                                        border-radius: 10px;
                                        margin-bottom: 30px;
                                        text-align: center;
                                      }
                                      .header h1 { font-size: 28px; margin-bottom: 10px; }
                                      .header p { font-size: 14px; opacity: 0.9; }
                                      .content { 
                                        background: #f8fafc; 
                                        padding: 30px; 
                                        border-radius: 10px;
                                        border: 2px solid #e2e8f0;
                                      }
                                      .invoice-info { 
                                        display: grid; 
                                        grid-template-columns: 1fr 1fr; 
                                        gap: 20px; 
                                        margin-bottom: 25px;
                                      }
                                      .info-item { 
                                        background: white; 
                                        padding: 15px; 
                                        border-radius: 8px;
                                        border-right: 4px solid #4f46e5;
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
                                        background: linear-gradient(135deg, #10b981, #059669);
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
                                      .description { 
                                        background: white; 
                                        padding: 20px; 
                                        border-radius: 8px;
                                        border: 1px solid #e2e8f0;
                                        margin: 20px 0;
                                      }
                                      .footer { 
                                        text-align: center; 
                                        margin-top: 30px; 
                                        padding: 20px;
                                        border-top: 2px dashed #cbd5e1;
                                        color: #64748b;
                                        font-size: 12px;
                                      }
                                      .status { 
                                        display: inline-block; 
                                        padding: 8px 16px; 
                                        border-radius: 20px; 
                                        font-size: 14px; 
                                        font-weight: bold;
                                        background: ${invoice.status === 'مدفوع' ? '#dcfce7' : '#fef3c7'};
                                        color: ${invoice.status === 'مدفوع' ? '#166534' : '#92400e'};
                                      }
                                      @media print { 
                                        body { margin: 0; } 
                                        .header { background: #4f46e5 !important; }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <h1>🧾 فاتورة</h1>
                                      <p>نظام إدارة الفواتير</p>
                                    </div>
                                    
                                    <div class="content">
                                      <div class="invoice-info">
                                        <div class="info-item">
                                          <div class="info-label">رقم الفاتورة</div>
                                          <div class="info-value">${invoice.invoice_number}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">اسم المورد</div>
                                          <div class="info-value">${invoice.supplier_name}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">تاريخ الفاتورة</div>
                                          <div class="info-value">${invoice.invoice_date}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">تاريخ الاستحقاق</div>
                                          <div class="info-value">${invoice.due_date}</div>
                                        </div>
                                      </div>
                                      
                                      <div class="amount-section">
                                        <div class="info-label" style="color: rgba(255,255,255,0.8); margin-bottom: 10px;">المبلغ الإجمالي</div>
                                        <div class="amount">${formatCurrency(invoice.amount)}</div>
                                      </div>
                                      
                                      <div class="info-item">
                                        <div class="info-label">حالة الدفع</div>
                                        <div class="info-value">
                                          <span class="status">${invoice.status}</span>
                                        </div>
                                      </div>
                                      
                                      ${invoice.description ? `
                                        <div class="description">
                                          <div class="info-label">تفاصيل الفاتورة</div>
                                          <div class="info-value">${invoice.description}</div>
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
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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