import React, { useState, useEffect } from 'react';
import SaleForm from '@/components/forms/SaleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Home, Users, DollarSign, Calendar, Trash2, Edit, Printer, Clock } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { supabase } from '@/integrations/supabase/client';

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const { sales, isLoading, deleteSale } = useSales();

  // جلب بيانات المشاريع لحساب حالة التأخير
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('name, expected_completion');
      setProjects(data || []);
    };
    fetchProjects();
  }, []);

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

  // حساب حالة التأخير في التسليم
  const getDeliveryStatus = (sale: any) => {
    // عرض فقط للمبيعات التي تحتوي على تاريخ بيع والحالة مباع أو محجوز
    if (!sale.sale_date || (sale.status !== 'مباع' && sale.status !== 'محجوز')) {
      return null;
    }

    const project = projects.find(p => p.name === sale.project_name);
    if (!project || !project.expected_completion) {
      return null;
    }

    const completionDate = new Date(project.expected_completion);
    const today = new Date();
    
    // حساب الفرق بالأيام ثم تحويله للأشهر
    const timeDiff = completionDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.round(daysDiff / 30.44); // متوسط أيام الشهر

    if (monthsRemaining < 0) {
      // العقد منتهي - أحمر
      return {
        status: 'منتهي الصلاحية',
        color: 'bg-red-100 text-red-800 hover:bg-red-100',
        months: Math.abs(monthsRemaining),
        icon: '🔴'
      };
    } else if (monthsRemaining <= 3) {
      // أصفر - 3 شهور أو أقل
      return {
        status: 'قريب الانتهاء',
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        months: monthsRemaining,
        icon: '🟡'
      };
    } else if (monthsRemaining > 6) {
      // أخضر - أكثر من 6 شهور
      return {
        status: 'وقت مناسب',
        color: 'bg-green-100 text-green-800 hover:bg-green-100',
        months: monthsRemaining,
        icon: '🟢'
      };
    } else {
      // بين 3-6 شهور - برتقالي
      return {
        status: 'متوسط',
        color: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        months: monthsRemaining,
        icon: '🟠'
      };
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
              const headers = "المشروع,رقم الوحدة,النوع,المساحة,السعر,العميل,الحالة,المبلغ المتبقي,تاريخ البيع\n";
              const csvContent = headers + 
                filteredSales.map(sale => 
                  `${sale.project_name},${sale.unit_number},${sale.unit_type},${sale.area},${sale.price},${sale.customer_name},${sale.status},${sale.remaining_amount || 0},${sale.sale_date || 'غير محدد'}`
                ).join("\n");
              
              // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
              const BOM = '\uFEFF';
              const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'sales.csv';
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
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">رقم الوحدة</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المساحة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">حالة التسليم</TableHead>
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
                      {(() => {
                        const deliveryStatus = getDeliveryStatus(sale);
                        if (!deliveryStatus) {
                          return <Badge variant="outline">غير محدد</Badge>;
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <Badge className={deliveryStatus.color}>
                              <span className="mr-1">{deliveryStatus.icon}</span>
                              {deliveryStatus.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {deliveryStatus.status === 'منتهي الصلاحية' 
                                ? `متأخر ${deliveryStatus.months} شهر`
                                : `${deliveryStatus.months} شهر`
                              }
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
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
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html dir="rtl">
                                  <head>
                                    <title>عقد بيع - ${sale.project_name} - وحدة ${sale.unit_number}</title>
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
                                         background: linear-gradient(135deg, #10b981, #059669);
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
                                      .sale-info { 
                                        display: grid; 
                                        grid-template-columns: 1fr 1fr; 
                                        gap: 20px; 
                                        margin-bottom: 25px;
                                      }
                                      .info-item { 
                                        background: white; 
                                        padding: 15px; 
                                        border-radius: 8px;
                                        border-right: 4px solid #10b981;
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
                                      .price-section { 
                                        background: linear-gradient(135deg, #7c3aed, #5b21b6);
                                        color: white; 
                                        padding: 25px; 
                                        border-radius: 10px;
                                        text-align: center;
                                        margin: 25px 0;
                                      }
                                      .price-section .price { 
                                        font-size: 32px; 
                                        font-weight: bold; 
                                        margin-bottom: 10px;
                                      }
                                      .customer-section { 
                                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                                        color: white; 
                                        padding: 20px; 
                                        border-radius: 10px;
                                        margin: 20px 0;
                                      }
                                      .customer-section h3 { 
                                        font-size: 18px; 
                                        margin-bottom: 15px;
                                        text-align: center;
                                      }
                                      .customer-info { 
                                        display: grid; 
                                        grid-template-columns: 1fr 1fr; 
                                        gap: 15px;
                                      }
                                      .payment-section { 
                                        background: white; 
                                        padding: 20px; 
                                        border-radius: 10px;
                                        border: 2px solid #e2e8f0;
                                        margin: 20px 0;
                                      }
                                      .payment-section h3 { 
                                        color: #1e293b; 
                                        margin-bottom: 15px;
                                        text-align: center;
                                      }
                                      .status { 
                                        display: inline-block; 
                                        padding: 8px 16px; 
                                        border-radius: 20px; 
                                        font-size: 14px; 
                                        font-weight: bold;
                                        background: ${sale.status === 'مباع' ? '#dcfce7' : sale.status === 'محجوز' ? '#fef3c7' : '#dbeafe'};
                                        color: ${sale.status === 'مباع' ? '#166534' : sale.status === 'محجوز' ? '#92400e' : '#1e40af'};
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
                                        .header { background: #10b981 !important; }
                                      }
                                    </style>
                                  </head>
                                   <body>
                                     <div class="header">
                                       <div class="logo-section">
                                         <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="شعار الشركة" class="logo" />
                                         <div></div>
                                       </div>
                                       <h1>🏠 عقد بيع / عرض سعر</h1>
                                       <p>نظام إدارة المبيعات العقارية</p>
                                     </div>
                                    
                                    <div class="content">
                                      <div class="sale-info">
                                        <div class="info-item">
                                          <div class="info-label">المشروع</div>
                                          <div class="info-value">${sale.project_name}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">رقم الوحدة</div>
                                          <div class="info-value">${sale.unit_number}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">نوع الوحدة</div>
                                          <div class="info-value">${sale.unit_type}</div>
                                        </div>
                                        <div class="info-item">
                                          <div class="info-label">المساحة</div>
                                          <div class="info-value">${sale.area} متر مربع</div>
                                        </div>
                                      </div>
                                      
                                      <div class="price-section">
                                        <div class="info-label" style="color: rgba(255,255,255,0.8); margin-bottom: 10px;">السعر الإجمالي</div>
                                        <div class="price">${sale.price.toLocaleString()} ريال سعودي</div>
                                        <div style="color: rgba(255,255,255,0.8);">شامل ضريبة القيمة المضافة</div>
                                      </div>
                                      
                                      <div class="customer-section">
                                        <h3>👤 بيانات العميل</h3>
                                        <div class="customer-info">
                                          <div>
                                            <div class="info-label" style="color: rgba(255,255,255,0.8);">الاسم</div>
                                            <div class="info-value" style="color: white;">${sale.customer_name}</div>
                                          </div>
                                          <div>
                                            <div class="info-label" style="color: rgba(255,255,255,0.8);">رقم الهاتف</div>
                                            <div class="info-value" style="color: white;">${sale.customer_phone || 'غير محدد'}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div class="payment-section">
                                        <h3>💳 تفاصيل الدفع</h3>
                                        <div class="sale-info">
                                          <div class="info-item">
                                            <div class="info-label">حالة البيع</div>
                                            <div class="info-value">
                                              <span class="status">${sale.status}</span>
                                            </div>
                                          </div>
                                          <div class="info-item">
                                            <div class="info-label">المبلغ المتبقي</div>
                                            <div class="info-value">${sale.remaining_amount > 0 ? `${sale.remaining_amount.toLocaleString()} ر.س` : 'مسدد بالكامل'}</div>
                                          </div>
                                          <div class="info-item">
                                            <div class="info-label">تاريخ البيع</div>
                                            <div class="info-value">${sale.sale_date || 'غير محدد'}</div>
                                          </div>
                                          <div class="info-item">
                                            <div class="info-label">خطة التقسيط</div>
                                            <div class="info-value">${sale.installment_plan || 'دفعة واحدة'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div class="footer">
                                      <p>📅 تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
                                      <p>🏢 شركة رافع للتطوير العقاري</p>
                                      <p>📍 الرياض، المملكة العربية السعودية</p>
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