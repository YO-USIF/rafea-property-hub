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
                            setEditingSupplier(supplier);
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
                            const supplierData = supplierStats[supplier.id] || {};
                            const printContent = `
                              <!DOCTYPE html>
                              <html dir="rtl" lang="ar">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>بيانات المورد - ${supplier.name}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
                                  
                                  * { margin: 0; padding: 0; box-sizing: border-box; }
                                  
                                  body { 
                                    font-family: 'Tajawal', Arial, sans-serif; 
                                    line-height: 1.6; 
                                    color: #2c3e50; 
                                    direction: rtl;
                                    background: #f8f9fa;
                                    padding: 40px;
                                  }
                                  
                                  .container {
                                    max-width: 800px;
                                    margin: 0 auto;
                                    background: white;
                                    border-radius: 12px;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                                    overflow: hidden;
                                  }
                                  
                                  .header { 
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 40px 30px;
                                    text-align: center;
                                    position: relative;
                                  }
                                  
                                  .header::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                                    opacity: 0.3;
                                  }
                                  
                                  .header h1 { 
                                    font-size: 2.5em; 
                                    font-weight: 700; 
                                    margin-bottom: 10px;
                                    position: relative;
                                    z-index: 1;
                                  }
                                  
                                  .header .subtitle {
                                    font-size: 1.1em;
                                    opacity: 0.9;
                                    font-weight: 300;
                                    position: relative;
                                    z-index: 1;
                                  }
                                  
                                  .print-date {
                                    position: absolute;
                                    top: 20px;
                                    left: 30px;
                                    font-size: 0.9em;
                                    opacity: 0.8;
                                    z-index: 1;
                                  }
                                  
                                  .content {
                                    padding: 40px 30px;
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
                                    font-size: 0.9em;
                                  }
                                  
                                  .value {
                                    color: #2c3e50;
                                    font-weight: 500;
                                    font-size: 1.1em;
                                  }
                                  
                                  .financial-highlights {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 20px;
                                  }
                                  
                                  .highlight-card {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 20px;
                                    border-radius: 8px;
                                    text-align: center;
                                  }
                                  
                                  .highlight-amount {
                                    font-size: 1.8em;
                                    font-weight: 700;
                                    margin-bottom: 5px;
                                  }
                                  
                                  .highlight-label {
                                    font-size: 0.9em;
                                    opacity: 0.9;
                                  }
                                  
                                  .notes-section {
                                    background: #fff3cd;
                                    border: 1px solid #ffeaa7;
                                    border-radius: 6px;
                                    padding: 20px;
                                    color: #856404;
                                  }
                                  
                                  .footer {
                                    background: #f8f9fa;
                                    padding: 20px 30px;
                                    text-align: center;
                                    color: #6c757d;
                                    font-size: 0.9em;
                                    border-top: 1px solid #dee2e6;
                                  }
                                  
                                  .status-badge {
                                    display: inline-block;
                                    padding: 6px 12px;
                                    border-radius: 20px;
                                    font-size: 0.85em;
                                    font-weight: 500;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                  }
                                  
                                  .status-active {
                                    background: #d4edda;
                                    color: #155724;
                                    border: 1px solid #c3e6cb;
                                  }
                                  
                                  .status-inactive {
                                    background: #f8d7da;
                                    color: #721c24;
                                    border: 1px solid #f5c6cb;
                                  }
                                  
                                  @media print { 
                                    body { 
                                      padding: 0;
                                      background: white;
                                    }
                                    .container {
                                      box-shadow: none;
                                      border-radius: 0;
                                    }
                                    .info-item:hover {
                                      transform: none;
                                      box-shadow: none;
                                    }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                  <div class="header">
                                    <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
                                    <h1>بيانات المورد</h1>
                                    <div class="subtitle">تقرير شامل لبيانات المورد والإحصائيات المالية</div>
                                  </div>
                                  
                                  <div class="content">
                                    <div class="section">
                                      <div class="section-title">المعلومات الأساسية</div>
                                      <div class="info-grid">
                                        <div class="info-item">
                                          <span class="label">اسم المورد</span>
                                          <span class="value">${supplier.name || 'غير محدد'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">الفئة</span>
                                          <span class="value">${supplier.category || 'غير محدد'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">اسم الشركة</span>
                                          <span class="value">${supplier.company || 'غير محدد'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">رقم الهاتف</span>
                                          <span class="value">${supplier.phone || 'غير محدد'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">البريد الإلكتروني</span>
                                          <span class="value">${supplier.email || 'غير محدد'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">حالة المورد</span>
                                          <span class="value">
                                            <span class="status-badge ${supplier.status === 'نشط' ? 'status-active' : 'status-inactive'}">
                                              ${supplier.status || 'غير محدد'}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                      <div class="info-item">
                                        <span class="label">العنوان</span>
                                        <span class="value">${(supplier as any).address || 'غير محدد'}</span>
                                      </div>
                                    </div>

                                    <div class="section">
                                      <div class="section-title">الإحصائيات المالية</div>
                                      <div class="financial-highlights">
                                        <div class="highlight-card">
                                          <div class="highlight-amount">${(supplierData.totalPurchases || 0).toLocaleString()}</div>
                                          <div class="highlight-label">إجمالي المشتريات (ريال سعودي)</div>
                                        </div>
                                        <div class="highlight-card">
                                          <div class="highlight-amount">${(supplierData.outstandingBalance || 0).toLocaleString()}</div>
                                          <div class="highlight-label">الرصيد المستحق (ريال سعودي)</div>
                                        </div>
                                      </div>
                                      <div class="info-grid" style="margin-top: 20px;">
                                        <div class="info-item">
                                          <span class="label">شروط الدفع</span>
                                          <span class="value">${supplierData.paymentTerms || '30 يوم'}</span>
                                        </div>
                                        <div class="info-item">
                                          <span class="label">التقييم</span>
                                          <span class="value">${supplierData.rating || 'ممتاز'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div class="section">
                                      <div class="section-title">ملاحظات إضافية</div>
                                      <div class="notes-section">
                                        ${(supplier as any).notes || 'لا توجد ملاحظات إضافية لهذا المورد'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div class="footer">
                                    تم إنشاء هذا التقرير بواسطة نظام إدارة الموردين • ${new Date().toLocaleDateString('ar-SA')}
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            printWindow?.document.write(printContent);
                            printWindow?.document.close();
                            printWindow?.print();
                          }}
                        >
                          <Printer className="w-4 h-4" />
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