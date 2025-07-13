
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Users, Building2, Eye } from 'lucide-react';
import CustomReportForm from '@/components/forms/CustomReportForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showCustomReportForm, setShowCustomReportForm] = useState(false);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const reportCategories = [
    {
      id: 'financial',
      title: 'التقارير المالية',
      description: 'تقارير الإيرادات والمصروفات والأرباح',
      icon: DollarSign,
      reports: [
        { name: 'تقرير الإيرادات الشهرية', lastGenerated: '2024-01-20' },
        { name: 'تقرير المصروفات التشغيلية', lastGenerated: '2024-01-19' },
        { name: 'تقرير الأرباح والخسائر', lastGenerated: '2024-01-18' }
      ]
    },
    {
      id: 'projects',
      title: 'تقارير المشاريع',
      description: 'تقارير حالة المشاريع والتقدم',
      icon: Building2,
      reports: [
        { name: 'تقرير تقدم المشاريع', lastGenerated: '2024-01-20' },
        { name: 'تقرير مركز تكلفة المشاريع', lastGenerated: '2024-01-19' },
        { name: 'تقرير التكاليف حسب المشروع', lastGenerated: '2024-01-19' },
        { name: 'تقرير المشاريع المتأخرة', lastGenerated: '2024-01-17' }
      ]
    },
    {
      id: 'sales',
      title: 'تقارير المبيعات',
      description: 'تقارير مبيعات الشقق والعقود',
      icon: TrendingUp,
      reports: [
        { name: 'تقرير المبيعات الشهرية', lastGenerated: '2024-01-20' },
        { name: 'تقرير العملاء الجدد', lastGenerated: '2024-01-19' },
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

  const quickStats = [
    {
      title: 'إجمالي التقارير',
      value: '48',
      description: 'تقرير متاح',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'التقارير الشهرية',
      value: '12',
      description: 'تقرير شهري',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'التقارير المجدولة',
      value: '8',
      description: 'تقرير آلي',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'معدل الاستخدام',
      value: '85%',
      description: 'من التقارير',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  // جلب تقرير مركز تكلفة المشاريع
  const { data: projectCostCenter, isLoading: isLoadingProjectCosts } = useQuery({
    queryKey: ['project-cost-center'],
    queryFn: async () => {
      // جلب المشاريع مع إجمالي تكاليفها
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, total_cost, total_units, sold_units, status');

      if (projectsError) throw projectsError;

      // جلب الفواتير لكل مشروع
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('project_id, amount, supplier_name, invoice_number')
        .not('project_id', 'is', null);

      if (invoicesError) throw invoicesError;

      // جلب المستخلصات لكل مشروع
      const { data: extracts, error: extractsError } = await supabase
        .from('extracts')
        .select('project_id, amount, contractor_name, extract_number')
        .not('project_id', 'is', null);

      if (extractsError) throw extractsError;

      // حساب التكاليف لكل مشروع
      return projects?.map(project => {
        const projectInvoices = invoices?.filter(inv => inv.project_id === project.id) || [];
        const projectExtracts = extracts?.filter(ext => ext.project_id === project.id) || [];
        
        const invoiceCosts = projectInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const extractCosts = projectExtracts.reduce((sum, ext) => sum + (ext.amount || 0), 0);
        const totalProjectCosts = invoiceCosts + extractCosts;

        return {
          ...project,
          invoiceCosts,
          extractCosts,
          totalProjectCosts,
          invoiceDetails: projectInvoices,
          extractDetails: projectExtracts,
          profitability: (project.sold_units / project.total_units) * 100
        };
      }) || [];
    },
    enabled: !!user?.id,
  });

  // وظائف التقارير
  const handleViewReport = async (reportName: string, category?: string) => {
    if (reportName === 'تقرير مركز تكلفة المشاريع') {
      setSelectedReport({ 
        name: reportName, 
        category: category || 'تقرير عام',
        data: projectCostCenter,
        type: 'project-cost-center'
      });
      setShowReportViewer(true);
    } else {
      setSelectedReport({ name: reportName, category: category || 'تقرير عام' });
      setShowReportViewer(true);
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
    return `تقرير: ${reportName}
تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}
الفترة: ${selectedPeriod}

=====================================

هذا تقرير تجريبي يحتوي على بيانات وهمية لأغراض العرض.

البيانات الرئيسية:
- إجمالي العمليات: 150
- المبلغ الإجمالي: 500,000 ريال
- معدل النمو: 15%
- عدد العملاء: 75

ملاحظات:
هذا تقرير تم إنشاؤه تلقائياً من نظام إدارة العقارات.
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
              <Input type="date" className="w-40" />
              <span className="flex items-center text-gray-500">إلى</span>
              <Input type="date" className="w-40" />
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
            {selectedReport?.type === 'project-cost-center' && selectedReport?.data ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">ملخص مراكز التكلفة</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedReport.data.length}</div>
                      <div className="text-sm text-gray-600">عدد المشاريع</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('ar-SA').format(
                          selectedReport.data.reduce((sum: number, proj: any) => sum + proj.totalProjectCosts, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">إجمالي التكاليف</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Intl.NumberFormat('ar-SA').format(
                          selectedReport.data.reduce((sum: number, proj: any) => sum + proj.invoiceCosts, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">تكاليف الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Intl.NumberFormat('ar-SA').format(
                          selectedReport.data.reduce((sum: number, proj: any) => sum + proj.extractCosts, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">تكاليف المستخلصات</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">تفاصيل المشاريع</h3>
                  <div className="space-y-4">
                    {selectedReport.data.map((project: any) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{project.name}</h4>
                            <div className="text-sm text-gray-500">
                              الحالة: {project.status} • الوحدات المباعة: {project.sold_units}/{project.total_units}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-red-600">
                              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(project.totalProjectCosts)}
                            </div>
                            <div className="text-sm text-gray-500">إجمالي التكاليف</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="font-medium text-blue-800">تكاليف الفواتير</div>
                            <div className="text-xl font-bold text-blue-600">
                              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(project.invoiceCosts)}
                            </div>
                            <div className="text-sm text-blue-600">عدد الفواتير: {project.invoiceDetails.length}</div>
                          </div>
                          
                          <div className="bg-orange-50 p-3 rounded">
                            <div className="font-medium text-orange-800">تكاليف المستخلصات</div>
                            <div className="text-xl font-bold text-orange-600">
                              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(project.extractCosts)}
                            </div>
                            <div className="text-sm text-orange-600">عدد المستخلصات: {project.extractDetails.length}</div>
                          </div>
                        </div>

                        {project.invoiceDetails.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-2">تفاصيل الفواتير:</h5>
                            <div className="space-y-1 text-sm">
                              {project.invoiceDetails.slice(0, 3).map((invoice: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{invoice.invoice_number} - {invoice.supplier_name}</span>
                                  <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(invoice.amount)}</span>
                                </div>
                              ))}
                              {project.invoiceDetails.length > 3 && (
                                <div className="text-gray-500">...و {project.invoiceDetails.length - 3} فواتير أخرى</div>
                              )}
                            </div>
                          </div>
                        )}

                        {project.extractDetails.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-2">تفاصيل المستخلصات:</h5>
                            <div className="space-y-1 text-sm">
                              {project.extractDetails.slice(0, 3).map((extract: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{extract.extract_number} - {extract.contractor_name}</span>
                                  <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(extract.amount)}</span>
                                </div>
                              ))}
                              {project.extractDetails.length > 3 && (
                                <div className="text-gray-500">...و {project.extractDetails.length - 3} مستخلصات أخرى</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">ملخص التقرير</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">150</div>
                      <div className="text-sm text-gray-600">إجمالي العمليات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">500,000</div>
                      <div className="text-sm text-gray-600">ريال سعودي</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">15%</div>
                      <div className="text-sm text-gray-600">معدل النمو</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">75</div>
                      <div className="text-sm text-gray-600">عدد العملاء</div>
                    </div>
                  </div>
                </div>
                
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
