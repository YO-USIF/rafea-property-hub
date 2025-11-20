import React, { useState, useEffect } from 'react';
import SupplierForm from '@/components/forms/SupplierForm';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Truck, FileText, DollarSign, Calendar, Trash2, Edit, Printer, Receipt } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedPage } from '@/components/ProtectedPage';
import { PermissionButton } from '@/components/PermissionButton';

const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [supplierStats, setSupplierStats] = useState<any>({});
  const [showAccountStatement, setShowAccountStatement] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
          invoice.supplier_name?.trim().toLowerCase() === supplier.name?.trim().toLowerCase() ||
          invoice.supplier_name?.includes(supplier.name) ||
          supplier.name?.includes(invoice.supplier_name)
        ) || [];

        console.log(`Supplier: ${supplier.name}, Invoices found: ${supplierInvoices.length}`);

        const totalPurchases = supplierInvoices.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
        const outstandingBalance = supplierInvoices
          .filter(invoice => invoice.status === 'غير مدفوع' || invoice.status === 'متأخر' || invoice.status === 'مستحق')
          .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);

        stats[supplier.id] = {
          totalPurchases,
          outstandingBalance,
          paymentTerms: '30 يوم', // يمكن إضافة هذا لاحقاً للموردين
          rating: 'ممتاز' // يمكن إضافة نظام تقييم لاحقاً
        };
      }

      console.log('Supplier Stats:', stats);
      console.log('Total purchases calculation:', Object.values(stats).reduce((sum: number, st: any) => sum + Number(st.totalPurchases || 0), 0));
      console.log('Total outstanding balance calculation:', Object.values(stats).reduce((sum: number, st: any) => sum + Number(st.outstandingBalance || 0), 0));
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

  const generateAccountStatement = async (supplier: any) => {
    try {
      // جلب الفواتير للمورد في الفترة المحددة
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('supplier_name', supplier.name)
        .order('invoice_date', { ascending: true });

      if (startDate) {
        query = query.gte('invoice_date', startDate);
      }
      if (endDate) {
        query = query.lte('invoice_date', endDate);
      }

      const { data: supplierInvoices, error } = await query;
      
      if (error) throw error;

      return supplierInvoices || [];
    } catch (error) {
      console.error('Error generating account statement:', error);
      return [];
    }
  };

  const printAccountStatement = async (supplier: any) => {
    const supplierInvoices = await generateAccountStatement(supplier);
    
    const printWindow = window.open('', '_blank');
    const totalAmount = supplierInvoices.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
    const paidAmount = supplierInvoices.filter(inv => inv.status === 'مدفوع').reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
    const remainingAmount = totalAmount - paidAmount;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>كشف حساب المورد - ${supplier.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Tajawal', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            direction: rtl;
            background: #f8f9fa;
            padding: 20px;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 { 
            font-size: 2.2em; 
            font-weight: 700; 
            margin-bottom: 10px;
          }
          
          .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .print-date {
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 0.9em;
            opacity: 0.8;
          }
          
          .content {
            padding: 30px;
          }
          
          .supplier-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-right: 4px solid #667eea;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .label {
            font-weight: 600;
            color: #495057;
          }
          
          .value {
            color: #212529;
          }
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .summary-card.total {
            border-color: #007bff;
          }
          
          .summary-card.paid {
            border-color: #28a745;
          }
          
          .summary-card.remaining {
            border-color: #dc3545;
          }
          
          .summary-card h3 {
            font-size: 0.9em;
            margin-bottom: 10px;
            color: #6c757d;
          }
          
          .summary-card .amount {
            font-size: 1.5em;
            font-weight: 700;
          }
          
          .total .amount { color: #007bff; }
          .paid .amount { color: #28a745; }
          .remaining .amount { color: #dc3545; }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .transactions-table th {
            background: #f8f9fa;
            padding: 15px 10px;
            text-align: center;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }
          
          .transactions-table td {
            padding: 12px 10px;
            text-align: center;
            border-bottom: 1px solid #dee2e6;
          }
          
          .transactions-table tr:last-child td {
            border-bottom: none;
          }
          
          .transactions-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
          }
          
          .status-paid {
            background: #d4edda;
            color: #155724;
          }
          
          .status-unpaid {
            background: #f8d7da;
            color: #721c24;
          }
          
          .status-review {
            background: #fff3cd;
            color: #856404;
          }
          
          .period-info {
            background: #e3f2fd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
            color: #0d47a1;
          }
          
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="شعار الشركة" style="height: 60px; object-fit: contain;" />
              <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
            </div>
            <h1>كشف حساب المورد</h1>
            <div class="subtitle">تقرير مفصل للمعاملات المالية</div>
          </div>
          
          <div class="content">
            <div class="supplier-info">
              <h2 style="margin-bottom: 20px; color: #2c3e50;">بيانات المورد</h2>
              <div class="info-row">
                <span class="label">اسم المورد:</span>
                <span class="value">${supplier.name || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">الشركة:</span>
                <span class="value">${supplier.company || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">الفئة:</span>
                <span class="value">${supplier.category || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">الهاتف:</span>
                <span class="value">${supplier.phone || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">البريد الإلكتروني:</span>
                <span class="value">${supplier.email || 'غير محدد'}</span>
              </div>
            </div>

            ${startDate || endDate ? `
              <div class="period-info">
                فترة الكشف: ${startDate ? `من ${startDate}` : 'من البداية'} ${endDate ? `إلى ${endDate}` : 'حتى اليوم'}
              </div>
            ` : ''}
            
            <div class="summary-cards">
              <div class="summary-card total">
                <h3>إجمالي الفواتير</h3>
                <div class="amount">${totalAmount.toLocaleString()} ر.س</div>
              </div>
              <div class="summary-card paid">
                <h3>المبلغ المدفوع</h3>
                <div class="amount">${paidAmount.toLocaleString()} ر.س</div>
              </div>
              <div class="summary-card remaining">
                <h3>الرصيد المتبقي</h3>
                <div class="amount">${remainingAmount.toLocaleString()} ر.س</div>
              </div>
            </div>
            
            <h3 style="margin-bottom: 15px; color: #2c3e50;">تفاصيل الفواتير</h3>
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${supplierInvoices.length > 0 ? supplierInvoices.map(invoice => `
                  <tr>
                    <td>${invoice.invoice_number || 'غير محدد'}</td>
                    <td>${new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</td>
                    <td>${invoice.description || 'غير محدد'}</td>
                    <td>${Number(invoice.amount).toLocaleString()} ر.س</td>
                    <td>${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                    <td>
                      <span class="status-badge ${invoice.status === 'مدفوع' ? 'status-paid' : invoice.status === 'غير مدفوع' ? 'status-unpaid' : 'status-review'}">
                        ${invoice.status || 'غير محدد'}
                      </span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">
                      لا توجد فواتير في الفترة المحددة
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'نشط').length;
  const totalPurchases = Object.values(supplierStats).reduce((sum: number, stats: any) => sum + Number(stats.totalPurchases || 0), 0);
  const totalOutstandingBalance = Object.values(supplierStats).reduce((sum: number, stats: any) => sum + Number(stats.outstandingBalance || 0), 0);

  return (
    <ProtectedPage pageName="suppliers" requirePermission="view">
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الموردون والفواتير</h1>
          <p className="text-gray-600 mt-2">إدارة الموردين ومتابعة الفواتير والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <PermissionButton
            pageName="suppliers"
            requirePermission="create"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مورد
          </PermissionButton>
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
            <div className="text-2xl font-bold">{Number(totalPurchases) > 0 ? Number(totalPurchases).toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المستحق</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(totalOutstandingBalance) > 0 ? Number(totalOutstandingBalance).toLocaleString() : '0'}</div>
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
              const headers = "اسم المورد,الفئة,الشركة,الهاتف,الحالة\n";
              const csvContent = headers + 
                filteredSuppliers.map(supplier => 
                  `${supplier.name},${supplier.category || ''},${supplier.company || ''},${supplier.phone || ''},${supplier.status}`
                ).join("\n");
              
              // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
              const BOM = '\uFEFF';
              const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'suppliers.csv';
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
                            setSelectedSupplier(supplier);
                            setShowAccountStatement(true);
                          }}
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                        <PermissionButton
                          pageName="suppliers"
                          requirePermission="edit"
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </PermissionButton>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            const supplierData = supplierStats[supplier.id] || {};
                            const printContent = `
                              <!DOCTYPE html>
                              <html dir="rtl" lang="ar">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>بيانات المورد - ${supplier.name}</title>
                                <style>
                                  body {
                                    font-family: 'Arial', sans-serif;
                                    padding: 40px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    min-height: 100vh;
                                  }
                                  
                                  .container {
                                    max-width: 800px;
                                    margin: 0 auto;
                                    background: white;
                                    padding: 40px;
                                    border-radius: 15px;
                                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                                  }
                                  
                                  .header {
                                    text-align: center;
                                    border-bottom: 3px solid #667eea;
                                    padding-bottom: 30px;
                                    margin-bottom: 40px;
                                  }
                                  
                                  .header h1 {
                                    color: #667eea;
                                    font-size: 2.5em;
                                    margin-bottom: 10px;
                                    font-weight: bold;
                                  }
                                  
                                  .header h2 {
                                    color: #764ba2;
                                    font-size: 1.8em;
                                    margin: 15px 0;
                                    font-weight: 600;
                                  }
                                  
                                  .date {
                                    color: #6c757d;
                                    font-size: 1em;
                                    margin-top: 10px;
                                  }
                                  
                                  .section { 
                                    margin-bottom: 35px;
                                    background: #f8f9fa;
                                    border-radius: 8px;
                                    padding: 25px;
                                    border-right: 4px solid #667eea;
                                  }
                                  
                                  .section-title { 
                                    font-size: 1.4em; 
                                    font-weight: 600; 
                                    color: #2c3e50;
                                    margin-bottom: 20px;
                                    display: flex;
                                    align-items: center;
                                  }
                                  
                                  .section-title::before {
                                    content: '●';
                                    color: #667eea;
                                    font-size: 1.2em;
                                    margin-left: 10px;
                                  }
                                  
                                  .info-grid {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 20px;
                                    margin-bottom: 15px;
                                  }
                                  
                                  .info-item {
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #e9ecef;
                                    transition: transform 0.2s ease;
                                  }
                                  
                                  .info-item:hover {
                                    transform: translateY(-2px);
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                  }
                                  
                                  .label { 
                                    font-weight: 600; 
                                    color: #495057;
                                    display: block;
                                    margin-bottom: 5px;
                                    font-size: 0.95em;
                                  }
                                  
                                  .value { 
                                    color: #212529;
                                    font-size: 1.1em;
                                    font-weight: 500;
                                  }
                                  
                                  .status-badge {
                                    display: inline-block;
                                    padding: 8px 16px;
                                    border-radius: 20px;
                                    font-weight: 600;
                                    font-size: 0.95em;
                                  }
                                  
                                  .status-active {
                                    background: #d4edda;
                                    color: #155724;
                                  }
                                  
                                  .status-inactive {
                                    background: #f8d7da;
                                    color: #721c24;
                                  }
                                  
                                  .highlight-box {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 20px;
                                    border-radius: 8px;
                                    text-align: center;
                                    margin-top: 20px;
                                  }
                                  
                                  .highlight-box .amount {
                                    font-size: 2em;
                                    font-weight: bold;
                                    margin: 10px 0;
                                  }
                                  
                                  @media print {
                                    body {
                                      background: white;
                                      padding: 0;
                                    }
                                    .container {
                                      box-shadow: none;
                                      padding: 20px;
                                    }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                  <div class="header">
                                    <h1>بيانات المورد</h1>
                                    <h2>${supplier.name}</h2>
                                    <div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
                                  </div>
                                  
                                  <div class="section">
                                    <div class="section-title">المعلومات الأساسية</div>
                                    <div class="info-grid">
                                      <div class="info-item">
                                        <span class="label">اسم المورد</span>
                                        <span class="value">${supplier.name}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">اسم الشركة</span>
                                        <span class="value">${supplier.company || '-'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">رقم الهاتف</span>
                                        <span class="value">${supplier.phone || '-'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">البريد الإلكتروني</span>
                                        <span class="value">${supplier.email || '-'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">التصنيف</span>
                                        <span class="value">${supplier.category || '-'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">الحالة</span>
                                        <span class="value">
                                          <span class="status-badge ${supplier.status === 'نشط' ? 'status-active' : 'status-inactive'}">
                                            ${supplier.status}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div class="section">
                                    <div class="section-title">البيانات المالية</div>
                                    <div class="info-grid">
                                      <div class="info-item">
                                        <span class="label">إجمالي المشتريات</span>
                                        <span class="value">${(supplierData.totalPurchases || 0).toLocaleString()} ر.س</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">الرصيد المستحق</span>
                                        <span class="value" style="color: #dc3545;">${(supplierData.outstandingBalance || 0).toLocaleString()} ر.س</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">شروط الدفع</span>
                                        <span class="value">${supplierData.paymentTerms || '-'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">التقييم</span>
                                        <span class="value">${supplierData.rating || '-'}</span>
                                      </div>
                                    </div>
                                    
                                    ${supplierData.outstandingBalance > 0 ? `
                                      <div class="highlight-box">
                                        <div style="font-size: 1.2em;">المبلغ المستحق الدفع</div>
                                        <div class="amount">${(supplierData.outstandingBalance || 0).toLocaleString()} ر.س</div>
                                        <div style="font-size: 0.9em; opacity: 0.9;">يرجى المتابعة مع قسم المحاسبة</div>
                                      </div>
                                    ` : ''}
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            
                            if (printWindow) {
                              printWindow.document.write(printContent);
                              printWindow.document.close();
                              setTimeout(() => {
                                printWindow.print();
                              }, 250);
                            }
                          }}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <PermissionButton
                          pageName="suppliers"
                          requirePermission="delete"
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSupplier.mutate(supplier.id)}
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

      {/* Account Statement Dialog */}
      <Dialog open={showAccountStatement} onOpenChange={setShowAccountStatement}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>كشف حساب المورد</DialogTitle>
            <DialogDescription>
              كشف حساب تفصيلي للمورد: {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">من تاريخ</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">إلى تاريخ</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => selectedSupplier && printAccountStatement(selectedSupplier)}
                className="flex-1"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة الكشف
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAccountStatement(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedPage>
  );
};

export default SuppliersPage;