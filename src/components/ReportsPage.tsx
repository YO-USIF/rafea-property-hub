
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Users, Building2, Eye } from 'lucide-react';
import CustomReportForm from '@/components/forms/CustomReportForm';
import SalesReport from '@/components/reports/SalesReport';
import PurchasesReport from '@/components/reports/PurchasesReport';
import InvoicesReport from '@/components/reports/InvoicesReport';
import ProfitLossReport from '@/components/reports/ProfitLossReport';
import { ProjectCostCenterReport } from '@/components/reports/ProjectCostCenterReport';
import { ProjectDetailedReport } from '@/components/reports/ProjectDetailedReport';
import ExtractsAndOrdersReport from '@/components/reports/ExtractsAndOrdersReport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showCustomReportForm, setShowCustomReportForm] = useState(false);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const reportCategories = [
    {
      id: 'financial',
      title: 'التقارير المالية',
      description: 'تقارير الإيرادات والمصروفات والأرباح',
      icon: DollarSign,
      reports: [
        { name: 'تقرير الأرباح والخسائر', lastGenerated: '2024-01-20' },
        { name: 'تقرير الفواتير', lastGenerated: '2024-01-19' },
        { name: 'تقرير المصروفات التشغيلية', lastGenerated: '2024-01-18' }
      ]
    },
    {
      id: 'projects',
      title: 'تقارير المشاريع',
      description: 'تقارير حالة المشاريع والتقدم',
      icon: Building2,
      reports: [
        { name: 'تقرير تفصيلي عن المشروع', lastGenerated: '2024-01-20' },
        { name: 'تقرير تقدم المشاريع', lastGenerated: '2024-01-20' },
        { name: 'تقرير مركز تكلفة المشاريع', lastGenerated: '2024-01-19' },
        { name: 'تقرير التكاليف حسب المشروع', lastGenerated: '2024-01-19' },
        { name: 'تقرير المشاريع المتأخرة', lastGenerated: '2024-01-17' },
        { name: 'تقرير المستخلصات وأوامر التكليف', lastGenerated: '2024-01-20' }
      ]
    },
    {
      id: 'sales',
      title: 'تقارير المبيعات',
      description: 'تقارير مبيعات الشقق والعقود',
      icon: TrendingUp,
      reports: [
        { name: 'تقرير المبيعات الشهرية', lastGenerated: '2024-01-20' },
        { name: 'تقرير المشتريات', lastGenerated: '2024-01-19' },
        { name: 'تقرير معدل التحويل', lastGenerated: '2024-01-18' }
      ]
    },
    {
      id: 'operations',
      title: 'تقارير العمليات',
      description: 'تقارير الصيانة والمهام والموظفين',
      icon: Users,
      reports: [
        { name: 'تقرير الصيانة والأعطال', lastGenerated: '2024-01-20' },
        { name: 'تقرير إنتاجية الموظفين', lastGenerated: '2024-01-19' },
        { name: 'تقرير المهام المكتملة', lastGenerated: '2024-01-18' }
      ]
    }
  ];

  // جلب بيانات المبيعات
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['sales-report', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('sales').select('*');
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // جلب بيانات الفواتير
  const { data: invoicesData = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices-report', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('invoices').select('*');
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // جلب بيانات المشتريات
  const { data: purchasesData = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['purchases-report', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('purchases').select('*');
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // جلب بيانات المستخلصات
  const { data: extractsData = [], isLoading: isLoadingExtracts } = useQuery({
    queryKey: ['extracts-report', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('extracts').select('*');
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // جلب بيانات المشاريع لتقرير مركز التكلفة
  const { data: projectsData = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects-report', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isLoadingData = isLoadingSales || isLoadingInvoices || isLoadingPurchases || isLoadingExtracts || isLoadingProjects;

  const quickStats = [
    {
      title: 'إجمالي المبيعات',
      value: salesData.length.toString(),
      description: 'عملية بيع',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'إجمالي الفواتير',
      value: invoicesData.length.toString(),
      description: 'فاتورة مسجلة',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'المشتريات الشهرية',
      value: purchasesData.length.toString(),
      description: 'طلب شراء',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'صافي الربح',
      value: (() => {
        const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.price || 0), 0);
        const totalExpenses = invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0) + 
                            purchasesData.reduce((sum, pur) => sum + (pur.total_amount || 0), 0) +
                            extractsData.reduce((sum, ext) => sum + (ext.amount || 0), 0);
        const profit = totalRevenue - totalExpenses;
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          notation: 'compact'
        }).format(profit);
      })(),
      description: 'ريال سعودي',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];
  if (isLoadingData) {
    return <div className="flex items-center justify-center h-64">جارٍ تحميل التقارير...</div>;
  }

  // وظائف التقارير
  const handleViewReport = async (reportName: string, category?: string) => {
    let reportData = null;
    let reportType = '';

    switch (reportName) {
      case 'تقرير المبيعات الشهرية':
        reportData = salesData;
        reportType = 'sales';
        break;
      case 'تقرير الفواتير':
        reportData = invoicesData;
        reportType = 'invoices';
        break;
      case 'تقرير المشتريات':
        reportData = purchasesData;
        reportType = 'purchases';
        break;
      case 'تقرير الأرباح والخسائر':
        reportData = { salesData, invoicesData, purchasesData, extractsData };
        reportType = 'profit-loss';
        break;
      case 'تقرير تفصيلي عن المشروع':
        // إنشاء تقرير تفصيلي عن المشاريع
        reportData = await generateProjectDetailedReport();
        reportType = 'project-detailed';
        break;
      case 'تقرير مركز تكلفة المشاريع':
      case 'تقرير التكاليف حسب المشروع':
        // إنشاء تقرير مركز التكلفة
        reportData = await generateProjectCostCenterReport();
        reportType = 'project-cost-center';
        break;
      case 'تقرير المستخلصات وأوامر التكليف':
        reportType = 'extracts-orders';
        break;
      default:
        reportData = null;
        reportType = 'general';
    }

    setSelectedReport({ 
      name: reportName, 
      category: category || 'تقرير عام',
      data: reportData,
      type: reportType
    });
    setShowReportViewer(true);
  };

  // دالة إنشاء التقرير التفصيلي للمشاريع
  const generateProjectDetailedReport = async () => {
    try {
      const projectsDetailedData = projectsData.map(project => {
        // فلترة المبيعات المرتبطة بهذا المشروع
        const projectSales = salesData.filter(sale => sale.project_id === project.id);
        const totalSales = projectSales.reduce((sum, sale) => sum + (sale.price || 0), 0);

        // فلترة الفواتير المرتبطة بهذا المشروع
        const projectInvoices = invoicesData.filter(invoice => {
          if (invoice.project_id === project.id) return true;
          const description = (invoice.description || '').toLowerCase();
          const projectName = (project.name || '').toLowerCase();
          return projectName && description.includes(projectName);
        });
        const totalInvoices = projectInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

        // فلترة المستخلصات المرتبطة بهذا المشروع
        const projectExtracts = extractsData.filter(extract => {
          if (extract.project_id === project.id) return true;
          const extractDescription = (extract.description || '').toLowerCase();
          const projectName = (project.name || '').toLowerCase();
          return projectName && extractDescription.includes(projectName);
        });
        const totalExtracts = projectExtracts.reduce((sum, extract) => sum + (extract.amount || 0), 0);

        // حساب الربح/الخسارة
        const netProfit = totalSales - (totalInvoices + totalExtracts);
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        return {
          id: project.id,
          name: project.name,
          totalSales,
          salesCount: projectSales.length,
          totalInvoices,
          invoicesCount: projectInvoices.length,
          totalExtracts,
          extractsCount: projectExtracts.length,
          netProfit,
          profitMargin
        };
      });

      return projectsDetailedData;
    } catch (error) {
      console.error('Error generating project detailed report:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير التفصيلي",
        variant: "destructive"
      });
      return [];
    }
  };

  // دالة إنشاء تقرير مركز التكلفة للمشاريع
  const generateProjectCostCenterReport = async () => {
    try {
      // إنشاء تقرير مفصل لكل مشروع مع تكاليفه
      const projectsCostReport = projectsData.map(project => {
        // فلترة الفواتير المرتبطة بهذا المشروع
        // البحث بـ project_id أو بالاسم في الوصف
        const projectInvoices = invoicesData.filter(invoice => {
          // ربط مباشر بـ project_id
          if (invoice.project_id === project.id) {
            return true;
          }
          
          // البحث في الوصف عن اسم المشروع أو كلمات مثل "سهيل A" أو "سهيل B"
          const description = (invoice.description || '').toLowerCase();
          const projectName = (project.name || '').toLowerCase();
          
          // إذا كان اسم المشروع يحتوي على "سهيل A"
          if (projectName.includes('سهيل a') || projectName.includes('سهيل أ')) {
            return description.includes('سهيل a') || description.includes('سهيل أ') || description.includes('سهيل a/b');
          }
          
          // إذا كان اسم المشروع يحتوي على "سهيل B" 
          if (projectName.includes('سهيل b') || projectName.includes('سهيل ب')) {
            return description.includes('سهيل b') || description.includes('سهيل ب') || description.includes('سهيل a/b');
          }
          
          // بحث عام عن اسم المشروع في الوصف
          return projectName && description.includes(projectName);
        });
        
        // فلترة المستخلصات المرتبطة بهذا المشروع
        const projectExtracts = extractsData.filter(extract => {
          // ربط مباشر بـ project_id
          if (extract.project_id === project.id) {
            return true;
          }
          
          // البحث في أسماء المشاريع أو أوصاف المستخلصات
          const extractDescription = (extract.description || '').toLowerCase();
          const contractorName = (extract.contractor_name || '').toLowerCase();
          const projectName = (project.name || '').toLowerCase();
          
          // البحث في الوصف أو اسم المقاول
          return projectName && (
            extractDescription.includes(projectName) ||
            contractorName.includes(projectName)
          );
        });
        
        // حساب التكاليف
        const invoiceCosts = projectInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
        const extractCosts = projectExtracts.reduce((sum, extract) => sum + (extract.amount || 0), 0);
        const totalProjectCosts = invoiceCosts + extractCosts;
        
        return {
          ...project,
          invoiceDetails: projectInvoices,
          extractDetails: projectExtracts,
          invoiceCosts,
          extractCosts,
          totalProjectCosts,
          invoiceCount: projectInvoices.length,
          extractCount: projectExtracts.length
        };
      });

      // فلترة المشاريع التي لها تكاليف فقط
      return projectsCostReport.filter(project => 
        project.totalProjectCosts > 0 || project.invoiceCount > 0 || project.extractCount > 0
      );
    } catch (error) {
      console.error('Error generating project cost center report:', error);
      toast({ 
        title: "خطأ في إنشاء التقرير", 
        description: "حدث خطأ أثناء إنشاء تقرير مركز التكلفة",
        variant: "destructive"
      });
      return [];
    }
  };

  const handleDownloadReport = (reportName: string) => {
    toast({ 
      title: "جاري التحميل", 
      description: `جاري تحميل ${reportName}...` 
    });
    
    // محاكاة تحميل ملف PDF
    setTimeout(() => {
      const element = document.createElement('a');
      const file = new Blob([generateReportContent(reportName)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${reportName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({ 
        title: "تم التحميل", 
        description: `تم تحميل ${reportName} بنجاح` 
      });
    }, 1000);
  };

  const generateReportContent = (reportName: string) => {
    const totalOperations = salesData.length + invoicesData.length + purchasesData.length + extractsData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.price || 0), 0);
    const totalExpenses = invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0) + 
                        purchasesData.reduce((sum, pur) => sum + (pur.total_amount || 0), 0) +
                        extractsData.reduce((sum, ext) => sum + (ext.amount || 0), 0);
    const totalAmount = totalRevenue + totalExpenses;
    const profit = totalRevenue - totalExpenses;
    
    return `تقرير: ${reportName}
تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}
الفترة: ${selectedPeriod}

=====================================

البيانات الفعلية من النظام:

البيانات الرئيسية:
- إجمالي العمليات: ${totalOperations}
- إجمالي المبيعات: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(totalRevenue)}
- إجمالي المصروفات: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(totalExpenses)}
- صافي الربح/الخسارة: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(profit)}
- عدد المبيعات: ${salesData.length}
- عدد الفواتير: ${invoicesData.length}
- عدد المشتريات: ${purchasesData.length}
- عدد المستخلصات: ${extractsData.length}

ملاحظات:
هذا تقرير يحتوي على بيانات حقيقية من نظام إدارة العقارات.
جميع البيانات محدثة حتى تاريخ: ${new Date().toLocaleDateString('ar-SA')}
`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والتحليلات</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة التقارير التفصيلية والتحليلات</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast({ title: "تصفية", description: "ميزة التصفية قيد التطوير" })}>
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCustomReportForm(true)}>
            <FileText className="w-4 h-4 ml-2" />
            إنشاء تقرير مخصص
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقارير</CardTitle>
          <CardDescription>اختر الفترة الزمنية وخصائص التقرير</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Button 
                variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('daily')}
                size="sm"
              >
                يومي
              </Button>
              <Button 
                variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('weekly')}
                size="sm"
              >
                أسبوعي
              </Button>
              <Button 
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('monthly')}
                size="sm"
              >
                شهري
              </Button>
              <Button 
                variant={selectedPeriod === 'quarterly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('quarterly')}
                size="sm"
              >
                ربع سنوي
              </Button>
            </div>
            <div className="flex gap-2 mr-auto">
              <Input 
                type="date" 
                className="w-40" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="من تاريخ"
              />
              <span className="flex items-center text-gray-500">إلى</span>
              <Input 
                type="date" 
                className="w-40" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="إلى تاريخ"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        آخر إنشاء: {report.lastGenerated}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.name)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleViewReport(report.name, category.title)}>
                        <Eye className="w-4 h-4 ml-1" />
                        عرض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>التقارير الأخيرة</CardTitle>
              <CardDescription>التقارير المُنشأة مؤخراً</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "عرض الكل", description: "جارٍ عرض جميع التقارير..." })}>عرض الكل</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'تقرير المبيعات الشهرية - يناير 2024', type: 'مالي', date: '2024-01-20', status: 'مكتمل' },
              { name: 'تقرير تقدم مشروع النخيل', type: 'مشاريع', date: '2024-01-19', status: 'قيد المعالجة' },
              { name: 'تقرير الصيانة والأعطال', type: 'عمليات', date: '2024-01-18', status: 'مكتمل' },
              { name: 'تقرير العملاء الجدد', type: 'مبيعات', date: '2024-01-17', status: 'مكتمل' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {report.type} • {report.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={report.status === 'مكتمل' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.name)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* عارض التقارير */}
      <Dialog open={showReportViewer} onOpenChange={setShowReportViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
            <DialogDescription>
              فئة التقرير: {selectedReport?.category}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-4">
            {selectedReport?.type === 'extracts-orders' ? (
              <ExtractsAndOrdersReport />
            ) : selectedReport?.type === 'project-detailed' && selectedReport?.data ? (
              <ProjectDetailedReport data={selectedReport.data} period={selectedPeriod} />
            ) : selectedReport?.type === 'project-cost-center' && selectedReport?.data ? (
              <ProjectCostCenterReport data={selectedReport.data} period={selectedPeriod} />
            ) : (
              <div>
                {selectedReport?.type === 'sales' && (
                  <SalesReport data={selectedReport.data} period={selectedPeriod} />
                )}
                {selectedReport?.type === 'invoices' && (
                  <InvoicesReport data={selectedReport.data} period={selectedPeriod} />
                )}
                {selectedReport?.type === 'purchases' && (
                  <PurchasesReport data={selectedReport.data} period={selectedPeriod} />
                )}
                {selectedReport?.type === 'profit-loss' && (
                  <ProfitLossReport 
                    salesData={selectedReport.data.salesData}
                    invoicesData={selectedReport.data.invoicesData}
                    purchasesData={selectedReport.data.purchasesData}
                    extractsData={selectedReport.data.extractsData}
                    period={selectedPeriod}
                  />
                )}
                {!['sales', 'invoices', 'purchases', 'profit-loss'].includes(selectedReport?.type) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">ملخص التقرير</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{salesData.length + invoicesData.length + purchasesData.length + extractsData.length}</div>
                        <div className="text-sm text-gray-600">إجمالي العمليات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(
                            salesData.reduce((sum, sale) => sum + (sale.price || 0), 0) +
                            invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0) +
                            purchasesData.reduce((sum, pur) => sum + (pur.total_amount || 0), 0) +
                            extractsData.reduce((sum, ext) => sum + (ext.amount || 0), 0)
                          )}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي المبالغ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{salesData.length}</div>
                        <div className="text-sm text-gray-600">عدد المبيعات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{invoicesData.length}</div>
                        <div className="text-sm text-gray-600">عدد الفواتير</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="font-semibold">تفاصيل التقرير</h3>
                  <div className="prose prose-sm max-w-none">
                    <p>هذا عرض تفصيلي للتقرير المختار. يمكنك مراجعة البيانات والإحصائيات بالتفصيل.</p>
                    <ul>
                      <li>تم إنشاء التقرير في: {new Date().toLocaleDateString('ar-SA')}</li>
                      <li>الفترة الزمنية: {selectedPeriod}</li>
                      <li>نوع التقرير: {selectedReport?.category}</li>
                      <li>حالة البيانات: محدثة</li>
                    </ul>
                    <p>لتحميل التقرير كملف، استخدم زر التحميل أعلاه.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReportViewer(false)}>
              إغلاق
            </Button>
            <Button onClick={() => selectedReport && handleDownloadReport(selectedReport.name)}>
              <Download className="w-4 h-4 ml-2" />
              تحميل التقرير
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomReportForm
        open={showCustomReportForm}
        onOpenChange={setShowCustomReportForm}
        onSuccess={() => {
          setShowCustomReportForm(false);
        }}
      />
    </div>
  );
};

export default ReportsPage;
