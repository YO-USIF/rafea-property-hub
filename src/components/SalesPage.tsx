import React, { useState, useEffect } from 'react';
import SaleForm from '@/components/forms/SaleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/PermissionButton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Home, Users, DollarSign, Calendar, Trash2, Edit, Printer, Clock, Building2, Filter } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useProjects } from '@/hooks/useProjects';

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const { sales, isLoading, deleteSale } = useSales();
  const { projects } = useProjects();

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

    // استخدام بيانات المشروع المرتبط مباشرة
    const project = sale.projects;
    
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

  // تصفية المبيعات حسب البحث والمشروع المحدد
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.unit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // تحسين التصفية لتدعم كلا من project_id و project_name
    const matchesProject = selectedProject === 'all' || 
      sale.project_id === selectedProject ||
      (sale.project_name && projects.find(p => p.id === selectedProject)?.name === sale.project_name);
    
    return matchesSearch && matchesProject;
  });

  // تجميع المبيعات حسب المشروع
  const salesByProject = filteredSales.reduce((acc, sale) => {
    // استخدام project_id إذا متوفر، وإلا استخدام project_name كمعرف
    const projectId = sale.project_id || `name-${sale.project_name?.replace(/\s+/g, '-')}`;
    const projectName = sale.project_name || 'مشروع غير محدد';
    
    if (!acc[projectId]) {
      acc[projectId] = {
        projectId,
        projectName,
        sales: [],
        stats: {
          totalUnits: 0,
          soldUnits: 0,
          reservedUnits: 0,
          availableUnits: 0,
          totalRevenue: 0
        }
      };
    }
    
    acc[projectId].sales.push(sale);
    acc[projectId].stats.totalUnits++;
    
    if (sale.status === 'مباع') {
      acc[projectId].stats.soldUnits++;
      acc[projectId].stats.totalRevenue += sale.price;
    } else if (sale.status === 'محجوز') {
      acc[projectId].stats.reservedUnits++;
    } else if (sale.status === 'متاح') {
      acc[projectId].stats.availableUnits++;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const totalUnits = filteredSales.length;
  const soldUnits = filteredSales.filter(unit => unit.status === 'مباع').length;
  const reservedUnits = filteredSales.filter(unit => unit.status === 'محجوز').length;
  const availableUnits = filteredSales.filter(unit => unit.status === 'متاح').length;
  const totalRevenue = filteredSales
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
        <PermissionButton
          pageName="sales"
          requirePermission="create"
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة عملية بيع
        </PermissionButton>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <CardTitle className="text-sm font-medium">المتاحة</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableUnits}</div>
            <p className="text-xs text-muted-foreground">وحدة متاحة</p>
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

      {/* الفلاتر وخيارات العرض */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية وتنظيم المبيعات</CardTitle>
          <CardDescription>اختر المشروع وطريقة العرض المناسبة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                  <SelectItem value="all">جميع المشاريع</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
                size="sm"
              >
                عرض شامل
              </Button>
              <Button 
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                onClick={() => setViewMode('grouped')}
                size="sm"
              >
                تجميع حسب المشروع
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Content */}
      {viewMode === 'grouped' ? (
        <div className="space-y-6">
          {Object.values(salesByProject).map((projectData: any) => (
            <Card key={projectData.projectId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {projectData.projectName?.includes('سهيل طيبة 5') && (
                    <img 
                      src="/src/assets/suhail-logo.jpeg" 
                      alt="شعار سهيل" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <Building2 className="h-5 w-5" />
                  {projectData.projectName}
                </CardTitle>
                <CardDescription>
                  {projectData.stats.totalUnits} وحدة - {projectData.stats.soldUnits} مباعة - {projectData.stats.reservedUnits} محجوزة - {projectData.stats.availableUnits} متاحة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* إحصائيات المشروع */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{projectData.stats.soldUnits}</div>
                    <div className="text-sm text-green-700">مباعة</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{projectData.stats.reservedUnits}</div>
                    <div className="text-sm text-yellow-700">محجوزة</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{projectData.stats.availableUnits}</div>
                    <div className="text-sm text-blue-700">متاحة</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">{(projectData.stats.totalRevenue / 1000000).toFixed(1)}م</div>
                    <div className="text-sm text-gray-700">إجمالي المبيعات</div>
                  </div>
                </div>
                
                {/* جدول مبيعات المشروع */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم الوحدة</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">المساحة</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">رقم الهوية</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">طريقة السداد</TableHead>
                        <TableHead className="text-right">حالة التسليم</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectData.sales.map((sale: any) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.unit_number}</TableCell>
                          <TableCell>{sale.unit_type}</TableCell>
                          <TableCell>{sale.area} م²</TableCell>
                          <TableCell>{sale.price.toLocaleString()} ر.س</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sale.customer_name}</div>
                              <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{sale.customer_id_number || 'غير محدد'}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm">{sale.payment_method || 'غير محدد'}</span>
                          </TableCell>
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
                            <div className="flex gap-2">
                              <PermissionButton
                                pageName="sales"
                                requirePermission="edit"
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingSale(sale);
                                  setShowForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
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
          ))}
        </div>
      ) : (
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
              const headers = "المشروع,رقم الوحدة,النوع,المساحة,السعر,العميل,رقم الهوية,الحالة,المبلغ المتبقي,تاريخ البيع\n";
              const csvContent = headers + 
                filteredSales.map(sale => 
                  `${sale.project_name},${sale.unit_number},${sale.unit_type},${sale.area},${sale.price},${sale.customer_name},${sale.customer_id_number || 'غير محدد'},${sale.status},${sale.remaining_amount || 0},${sale.sale_date || 'غير محدد'}`
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
                  <TableHead className="text-right">رقم الهوية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">طريقة السداد</TableHead>
                  <TableHead className="text-right">حالة التسليم</TableHead>
                  <TableHead className="text-right">المبلغ المتبقي</TableHead>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {sale.project_name?.includes('سهيل طيبة 5') && (
                          <img 
                            src="/src/assets/suhail-logo.jpeg" 
                            alt="شعار سهيل" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span>{sale.project_name}</span>
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <span className="text-sm">{sale.customer_id_number || 'غير محدد'}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{sale.payment_method || 'غير محدد'}</span>
                    </TableCell>
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
                        <PermissionButton
                          pageName="sales"
                          requirePermission="edit"
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSale(sale);
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
                                      <p>🏢 شركة سهيل طيبة للتطوير العقاري</p>
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
      )}

      {/* Sale Form Dialog */}
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